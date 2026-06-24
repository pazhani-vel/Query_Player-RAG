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
# Vector Store
# ─────────────────────────────────────────────
class VectorStore:
    """Manages document embeddings in a ChromaDB vector store."""

    def __init__(
        self,
        collection_name: str = COLLECTION_NAME,
        persist_directory: str = VECTOR_STORE_DIR,
    ):
        self.collection_name = collection_name
        self.persist_directory = persist_directory
        self.client = None
        self.collection = None
        self._initialize_store()

    def _initialize_store(self):
        os.makedirs(self.persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(path=self.persist_directory)

        # Check if the collection already exists with the wrong distance metric (l2).
        # If it does, delete it so it gets recreated with cosine — otherwise retrieval
        # returns 0 results even though documents are indexed.
        existing = [c.name for c in self.client.list_collections()]
        if self.collection_name in existing:
            col = self.client.get_collection(self.collection_name)
            current_space = col.metadata.get("hnsw:space", "l2")
            if current_space != "cosine":
                print(
                    f"[WARNING] Collection '{self.collection_name}' uses '{current_space}' distance. "
                    "Deleting and recreating with cosine. Re-upload your PDFs."
                )
                self.client.delete_collection(self.collection_name)

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={
                "description": "PDF document embeddings for RAG",
                "hnsw:space": "cosine",   # ← required for SentenceTransformer embeddings
            },
        )
        print(
            f"Vector store ready. Collection: {self.collection_name} | "
            f"Distance: cosine | Docs: {self.collection.count()}"
        )

    def add_documents(self, documents: List[Any], embeddings: np.ndarray):
        if len(documents) != len(embeddings):
            raise ValueError("Document count must match embedding count")

        ids, metadatas, documents_text, embeddings_list = [], [], [], []

        for i, (doc, emb) in enumerate(zip(documents, embeddings)):
            doc_id = f"doc_{uuid.uuid4().hex[:8]}_{i}"
            ids.append(doc_id)

            metadata = dict(doc.metadata)
            metadata["doc_index"] = i
            metadata["content_length"] = len(doc.page_content)
            metadatas.append(metadata)

            documents_text.append(doc.page_content)
            embeddings_list.append(emb.tolist())

        self.collection.add(
            ids=ids,
            embeddings=embeddings_list,
            metadatas=metadatas,
            documents=documents_text,
        )
        print(f"Added {len(documents)} chunks. Total: {self.collection.count()}")
