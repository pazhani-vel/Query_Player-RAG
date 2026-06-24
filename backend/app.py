import os
import uuid
import numpy as np
from pathlib import Path
from typing import List, Dict, Any

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# LangChain / document processing
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Embeddings
from sentence_transformers import SentenceTransformer

# Vector store
import chromadb

# LLM
from langchain_groq import ChatGroq

# importing models

from models.vectorstore import VectorStore
from models.RagRetreival import RAGRetriever
from models.embedding import EmbeddingManager

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
load_dotenv()

UPLOAD_FOLDER = "./data/uploaded_docs"
VECTOR_STORE_DIR = "./data/vector_store"
COLLECTION_NAME = "pdf_documents"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
GROQ_MODEL = "llama-3.3-70b-versatile"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

# ─────────────────────────────────────────────
# Flask app
# ─────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")}})
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
def process_pdf(pdf_path: str) -> List[Any]:
    """Load and chunk a single PDF file."""
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    filename = Path(pdf_path).name
    for doc in documents:
        doc.metadata["source_file"] = filename
        doc.metadata["file_type"] = "pdf"

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )
    chunks = splitter.split_documents(documents)
    print(f"{filename}: {len(documents)} pages → {len(chunks)} chunks")
    return chunks


def rag_query(query: str, retriever: RAGRetriever, llm: ChatGroq, top_k: int = 3):
    """Retrieve context and generate an answer with Groq LLM."""
    results = retriever.retrieve(query, top_k=top_k)

    if not results:
        return None, []

    context = "\n\n".join([doc["content"] for doc in results])

    prompt = (
        "Use the following context to answer the question concisely and accurately. "
        "Give a confidence level out of 100 at the end.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {query}\n\n"
        "Answer:"
    )

    response = llm.invoke(prompt)
    return response.content, results


# ─────────────────────────────────────────────
# Lazy-initialised singletons
# (loaded once on first request so startup is fast)
# ─────────────────────────────────────────────
_embedding_manager: EmbeddingManager = None
_vector_store: VectorStore = None
_retriever: RAGRetriever = None
_llm: ChatGroq = None


def get_components():
    global _embedding_manager, _vector_store, _retriever, _llm

    if _embedding_manager is None:
        _embedding_manager = EmbeddingManager()

    if _vector_store is None:
        _vector_store = VectorStore()

    if _retriever is None:
        _retriever = RAGRetriever(_vector_store, _embedding_manager)

    if _llm is None:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise EnvironmentError("GROQ_API_KEY is not set in your .env file")
        _llm = ChatGroq(
            groq_api_key=groq_api_key,
            model_name=GROQ_MODEL,
            temperature=0.1,
            max_tokens=1024,
        )

    return _embedding_manager, _vector_store, _retriever, _llm


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route("/upload", methods=["POST"])
def upload_files():
    """
    POST /upload
    Content-Type: multipart/form-data
    Field: files  (one or many PDF files)
    """
    if "files" not in request.files:
        return jsonify({"status": "error", "message": "No 'files' field in request"}), 400

    embedding_manager, vector_store, _, _ = get_components()

    files = request.files.getlist("files")
    saved_filenames = []

    for file in files:
        if not file or file.filename == "":
            continue
        if not file.filename.lower().endswith(".pdf"):
            continue

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        try:
            # Process → embed → store
            chunks = process_pdf(file_path)
            texts = [doc.page_content for doc in chunks]
            embeddings = embedding_manager.generate_embeddings(texts)
            vector_store.add_documents(chunks, embeddings)
            saved_filenames.append(filename)
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            return jsonify({"status": "error", "message": f"Failed to process {filename}: {str(e)}"}), 500

    if not saved_filenames:
        return jsonify({"status": "error", "message": "No valid PDF files uploaded"}), 400

    return jsonify({"status": "success", "documents": saved_filenames}), 200


@app.route("/query", methods=["POST"])
def query_rag():
    """
    POST /query
    Content-Type: application/json
    Body: { "question": "..." }
    """
    data = request.get_json() or {}
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"status": "error", "message": "Question cannot be empty"}), 400

    try:
        _, _, retriever, llm = get_components()
        answer, sources = rag_query(question, retriever, llm)
    except EnvironmentError as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": f"RAG query failed: {str(e)}"}), 500

    if answer is None:
        return jsonify({
            "answer": "No relevant documents found. Please upload PDFs first.",
            "sources": [],
        }), 200

    # Format sources to match frontend expectation
    formatted_sources = [
        {
            "document": src["metadata"].get("source_file", "unknown"),
            "page": src["metadata"].get("page", 0) + 1,  # LangChain pages are 0-indexed
            "text": src["content"][:300],                  # preview snippet
        }
        for src in sources
    ]

    return jsonify({"answer": answer, "sources": formatted_sources}), 200


@app.route("/reset", methods=["POST"])
def reset_collection():
    """
    POST /reset
    Deletes and recreates the ChromaDB collection (clears all indexed chunks).
    Useful after fixing the distance metric or to start fresh.
    """
    global _vector_store, _retriever
    try:
        _, vector_store, _, _ = get_components()
        vector_store.client.delete_collection(COLLECTION_NAME)
        vector_store.collection = vector_store.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={
                "description": "PDF document embeddings for RAG",
                "hnsw:space": "cosine",
            },
        )
        # Reset cached singletons so retriever re-binds to new collection
        _retriever = None
        print("Collection reset. Re-upload your PDFs.")
        return jsonify({"status": "success", "message": "Collection reset. Please re-upload your PDFs."}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Quick health check — also returns doc count in vector store."""
    try:
        _, vector_store, _, _ = get_components()
        doc_count = vector_store.collection.count()
        return jsonify({"status": "ok", "indexed_chunks": doc_count}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/documents/<path:filename>", methods=["DELETE"])
def delete_document(filename: str):
    """
    DELETE /documents/<filename>
    Deletes a single PDF from the upload folder AND removes its chunks
    from ChromaDB (matched by source_file metadata).
    """
    try:
        _, vector_store, _, _ = get_components()

        # 1. Delete the file from disk
        file_path = os.path.join(UPLOAD_FOLDER, secure_filename(filename))
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
        else:
            print(f"File not found on disk (may already be deleted): {filename}")

        # 2. Remove all ChromaDB chunks whose metadata source_file matches
        results = vector_store.collection.get(where={"source_file": filename})
        chunk_ids = results.get("ids", [])

        if chunk_ids:
            vector_store.collection.delete(ids=chunk_ids)
            print(f"Removed {len(chunk_ids)} chunks for '{filename}' from ChromaDB")
        else:
            print(f"No chunks found in ChromaDB for '{filename}'")

        return jsonify({
            "status": "success",
            "message": f"Deleted '{filename}' and {len(chunk_ids)} associated chunks.",
        }), 200

    except Exception as e:
        print(f"Error deleting document '{filename}': {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/daily-reset", methods=["POST"])
def daily_reset():
    """
    POST /daily-reset
    Called on every page refresh from the frontend.
    - Deletes ALL PDFs from the upload folder (keeps the folder itself)
    - Wipes and recreates the ChromaDB collection (keeps the vector_store folder)
    - Resets in-memory singletons so the next request starts clean
    """
    global _vector_store, _retriever

    try:
        # 1. Wipe all PDFs from upload folder
        deleted_files = []
        upload_path = Path(UPLOAD_FOLDER)
        for pdf_file in upload_path.glob("**/*.pdf"):
            pdf_file.unlink()
            deleted_files.append(pdf_file.name)
        print(f"Daily reset: deleted {len(deleted_files)} PDF(s) from upload folder")

        # 2. Wipe ChromaDB collection and recreate it (keeps the folder)
        _, vector_store, _, _ = get_components()
        vector_store.client.delete_collection(COLLECTION_NAME)
        vector_store.collection = vector_store.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={
                "description": "PDF document embeddings for RAG",
                "hnsw:space": "cosine",
            },
        )
        print("Daily reset: ChromaDB collection wiped and recreated")

        # 3. Reset cached singletons — retriever re-binds on next request
        _retriever = None
        print("Daily reset complete.")

        return jsonify({
            "status": "success",
            "message": f"Reset complete. Deleted {len(deleted_files)} PDF(s) and cleared the vector store.",
            "deleted_files": deleted_files,
        }), 200

    except Exception as e:
        print(f"Daily reset failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)