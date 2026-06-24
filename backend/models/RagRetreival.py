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
# RAG Retriever 
# ─────────────────────────────────────────────
class RAGRetriever:
    """Handles query-based retrieval from the vector store."""

    def __init__(self, vector_store: VectorStore, embedding_manager: EmbeddingManager):
        self.vector_store = vector_store
        self.embedding_manager = embedding_manager

    def retrieve(
        self, query: str, top_k: int = 5, score_threshold: float = 0.0
    ) -> List[Dict[str, Any]]:
        query_embedding = self.embedding_manager.generate_embeddings([query])[0]

        results = self.vector_store.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k,
        )

        retrieved_docs = []
        if results["documents"] and results["documents"][0]:
            for doc_id, document, metadata, distance in zip(
                results["ids"][0],
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                # With hnsw:space=cosine, ChromaDB returns cosine *distance* (0 = identical, 2 = opposite).
                # Convert to a 0–1 similarity score.
                similarity_score = 1 - (distance / 2)
                print(f"  doc={doc_id} distance={distance:.4f} similarity={similarity_score:.4f}")
                if similarity_score >= score_threshold:
                    retrieved_docs.append(
                        {
                            "id": doc_id,
                            "content": document,
                            "metadata": metadata,
                            "similarity_score": round(similarity_score, 4),
                        }
                    )

        print(f"Retrieved {len(retrieved_docs)} docs for query: '{query}'")
        return retrieved_docs
