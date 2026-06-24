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
#  EmbeddingManager
# ─────────────────────────────────────────────


class EmbeddingManager:
    """Handles document embedding generation using Sentence Transformer."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self):
        print(f"Loading embedding model: {self.model_name}")
        self.model = SentenceTransformer(self.model_name)
        print(f"Model loaded. Dimension: {self.model.get_sentence_embedding_dimension()}")

    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        if not self.model:
            raise ValueError("Embedding model not loaded")
        return self.model.encode(texts, show_progress_bar=False)

