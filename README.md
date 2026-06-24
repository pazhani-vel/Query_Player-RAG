# Query Player – RAG

A full-stack Retrieval-Augmented Generation (RAG) app for chatting with your PDF documents. Upload PDFs, ask questions in natural language, and get answers grounded in your documents — complete with source citations and an in-browser PDF viewer.

## Features

- 📄 **PDF Upload & Indexing** – Upload one or many PDFs; they're chunked, embedded, and stored in a vector database
- 💬 **Conversational Q&A** – Ask questions and get LLM-generated answers backed by your documents
- 🔍 **Source Attribution** – Every answer links back to the originating document, page, and text snippet
- 🗂️ **Document Management** – List and delete individual documents from the workspace
- 🔄 **Session Reset** – Clear the vector store and start fresh (manual or automatic on refresh)

## Tech Stack

**Backend**
- [Flask](https://flask.palletsprojects.com/) – REST API server
- [LangChain](https://www.langchain.com/) – document loading & text splitting
- [Sentence-Transformers](https://www.sbert.net/) (`all-MiniLM-L6-v2`) – embeddings
- [ChromaDB](https://www.trychroma.com/) – vector store (cosine similarity)
- [Groq](https://groq.com/) (`llama-3.3-70b-versatile`) – LLM inference via `langchain-groq`

**Frontend**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) – build tool & dev server
- [TanStack Query](https://tanstack.com/query) – data fetching/state
- [Tailwind CSS](https://tailwindcss.com/) – styling
- [react-pdf](https://github.com/wojtekmaj/react-pdf) – PDF rendering
- [Axios](https://axios-http.com/) – HTTP client

## Project Structure

```
Query_Player-RAG-main/
├── backend/
│   ├── app.py              # Flask API (upload, query, reset, health, document delete)
│   ├── requirements.txt
│   ├── data/               # Uploaded PDFs + Chroma vector store (gitignored)
│   └── logs/
├── frontend/
│   ├── src/
│   │   ├── components/     # Chat, Sidebar, PDF viewer, source panel, etc.
│   │   ├── pages/          # Dashboard page
│   │   ├── contexts/       # Workspace context
│   │   ├── services/       # API client
│   │   └── types/
│   └── package.json
└── Output/                 # Screenshots
```

## Architecture / How It Works

1. **Upload** – PDFs are saved to disk, loaded with `PyPDFLoader`, and split into overlapping chunks (`RecursiveCharacterTextSplitter`).
2. **Embed** – Each chunk is embedded using `all-MiniLM-L6-v2` (Sentence-Transformers).
3. **Store** – Embeddings + metadata (source file, page number) are stored in a ChromaDB collection using cosine similarity.
4. **Query** – On a question, the query is embedded and the top-k most similar chunks are retrieved.
5. **Generate** – Retrieved chunks are passed as context to a Groq-hosted LLM, which generates a concise answer with a confidence score.
6. **Cite** – The response is returned with structured source metadata (document name, page, snippet) for the frontend to display.

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create/update `backend/.env`:

```env
GROQ_API_KEY=your-groq-api-key
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K=5
FRONTEND_ORIGIN=http://localhost:5173
```

Run the server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
```

Create/update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Reference

| Method | Endpoint                    | Description                                      |
|--------|------------------------------|---------------------------------------------------|
| POST   | `/upload`                   | Upload PDF(s) for indexing (`multipart/form-data`, field: `files`) |
| POST   | `/query`                    | Ask a question — `{ "question": "..." }`          |
| POST   | `/reset`                    | Wipe and recreate the vector store collection      |
| POST   | `/daily-reset`               | Clear all uploaded PDFs and reset the collection   |
| DELETE | `/documents/<filename>`     | Delete a single document and its indexed chunks    |
| GET    | `/health`                   | Health check + count of indexed chunks             |

### Example: Query

```bash
curl -X POST http://localhost:5000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main conclusion of the report?"}'
```

Response:

```json
{
  "answer": "...",
  "sources": [
    {
      "document": "report.pdf",
      "page": 3,
      "text": "..."
    }
  ]
}
```

## Screenshots

See the `Output/` folder for screenshots of the application in action.

## License

This project is provided as-is. Add a license of your choice (MIT, Apache 2.0, etc.) if you plan to distribute it.
