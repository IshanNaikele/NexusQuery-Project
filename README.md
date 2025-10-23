# NexusQuery: Multi-Source Hybrid Search and RAG Engine

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed on AWS](https://img.shields.io/badge/Deployed-AWS%20EC2-orange.svg)](https://aws.amazon.com/ec2/)

> An enterprise-grade cognitive search and Retrieval-Augmented Generation (RAG) system that intelligently retrieves information from heterogeneous data sources using advanced hybrid search techniques.

## 🎯 Overview

NexusQuery is a production-ready RAG engine that demonstrates advanced information retrieval by combining:
- **Hybrid Search**: Merges semantic (vector) and lexical (keyword) search for superior accuracy
- **Reciprocal Rank Fusion (RRF)**: Intelligently re-ranks results from multiple retrievers
- **Multi-Source Ingestion**: Handles PDFs, web content, and structured SQL databases
- **Knowledge Graph Integration**: Leverages Neo4j for entity-relationship reasoning
- **Full MLOps Pipeline**: Automated testing, containerization, and cloud deployment on AWS EC2

This project showcases production-level system design, not just algorithmic experimentation.

## 🚀 Key Features

### Advanced Retrieval Architecture
- **Dual-Mode Search**: Combines FAISS vector similarity search with PostgreSQL full-text search
- **Reciprocal Rank Fusion**: State-of-the-art result re-ranking algorithm that outperforms single-method retrieval
- **Adaptive Query Routing**: Automatically determines whether to use vector store or knowledge graph based on query type
- **Context-Aware Generation**: LangChain-powered answer synthesis with source attribution

### Multi-Source Data Ingestion
- **PDF Processing**: Extracts and chunks documents with configurable overlap strategies
- **Web Scraping**: Intelligently crawls and processes documentation websites
- **SQL Integration**: Indexes structured data from PostgreSQL tables with semantic understanding
- **Knowledge Graph**: Extracts entities and relationships from documents into Neo4j

### Production-Grade Infrastructure
- **RESTful API**: Clean FastAPI endpoints with automatic OpenAPI documentation
- **Containerized Deployment**: Multi-service Docker Compose orchestration
- **Cloud Deployment**: Live on AWS EC2 with Gunicorn + NGINX reverse proxy
- **Comprehensive Testing**: Unit and integration tests with pytest

## 🏗️ Architecture
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│      NGINX (Reverse Proxy)          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      FastAPI Application            │
│  ┌──────────────────────────────┐   │
│  │   Query Orchestrator         │   │
│  └────────┬─────────────────────┘   │
│           │                          │
│  ┌────────▼──────────┐               │
│  │  Hybrid Retriever │               │
│  │   (RRF Fusion)    │               │
│  └────┬───────┬──────┘               │
│       │       │                      │
│   ┌───▼───┐ ┌▼────────┐              │
│   │Vector │ │ Lexical │              │
│   │Search │ │ Search  │              │
│   │(FAISS)│ │(PgSQL)  │              │
│   └───┬───┘ └┬────────┘              │
│       │      │                       │
│  ┌────▼──────▼─────┐   ┌──────────┐  │
│  │  LLM Generator  │◄──┤Knowledge │  │
│  │   (LangChain)   │   │  Graph   │  │
│  └─────────────────┘   │ (Neo4j)  │  │
└─────────────────────────┴──────────┘  │
```

## 📋 Prerequisites

- **Python**: 3.11 or higher
- **Docker**: 20.10+ and Docker Compose 2.0+
- **PostgreSQL**: 14+ (or use Docker container)
- **Neo4j**: 5.0+ (optional, for knowledge graph features)
- **Cloud Account**: AWS (currently deployed on EC2)
- **API Keys**: OpenAI API key (or alternative LLM provider)

## 🔧 Installation

### Local Development Setup
```bash
# Clone the repository
git clone https://github.com/IshanNaikele/NexusQuery-Project.git
cd NexusQuery-Project

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database credentials
```

### Docker Setup (Recommended)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## ⚙️ Configuration

Create a `.env` file in the project root:
```env
# LLM Configuration
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-small

# Vector Store
PINECONE_API_KEY=your_pinecone_key  # Optional: Use FAISS for local
PINECONE_ENVIRONMENT=us-west1-gcp

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nexusquery
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Neo4j (Optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
WORKERS=4

# Search Configuration
HYBRID_SEARCH_ALPHA=0.5  # 0=keyword only, 1=semantic only
RRF_K=60  # Reciprocal Rank Fusion constant
TOP_K_RESULTS=5
```

## 🎮 Usage

### Starting the API Server
```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### API Endpoints

#### 1. Ingest PDF Documents
```bash
curl -X POST "http://localhost:8000/ingest/pdf" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/document.pdf" \
  -F "metadata={\"source\":\"internal\",\"department\":\"engineering\"}"
```

**Response:**
```json
{
  "status": "success",
  "document_id": "doc_abc123",
  "chunks_created": 45,
  "processing_time": 12.3
}
```

#### 2. Ingest Web Content
```bash
curl -X POST "http://localhost:8000/ingest/web" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com/api-guide",
    "max_depth": 2,
    "follow_links": true
  }'
```

**Response:**
```json
{
  "status": "success",
  "pages_scraped": 15,
  "chunks_created": 230,
  "urls_processed": [
    "https://docs.example.com/api-guide",
    "https://docs.example.com/api-guide/authentication"
  ]
}
```

#### 3. Ingest SQL Table
```bash
curl -X POST "http://localhost:8000/ingest/sql" \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "products",
    "text_columns": ["name", "description", "specifications"],
    "metadata_columns": ["category", "price", "created_at"]
  }'
```

**Response:**
```json
{
  "status": "success",
  "rows_indexed": 1250,
  "chunks_created": 1250
}
```

#### 4. Query the System
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the authentication requirements for the API?",
    "search_mode": "hybrid",
    "use_knowledge_graph": false
  }'
```

**Response:**
```json
{
  "answer": "The API requires OAuth 2.0 authentication with JWT tokens. You need to obtain an access token by sending your client credentials to the /auth/token endpoint. Tokens expire after 1 hour and must be included in the Authorization header as 'Bearer {token}'.",
  "sources": [
    {
      "content": "Authentication is handled via OAuth 2.0...",
      "metadata": {
        "source": "https://docs.example.com/api-guide/authentication",
        "chunk_id": "chunk_456"
      },
      "score": 0.92
    }
  ],
  "retrieval_method": "hybrid_rrf",
  "processing_time": 2.1
}
```

### Interactive API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test categories
pytest tests/unit/
pytest tests/integration/
pytest tests/e2e/

# Run with verbose output
pytest -v -s
```

## 🐳 Docker Deployment

### Building the Image
```bash
# Build production image
docker build -t nexusquery:latest .

# Build with specific platform
docker build --platform linux/amd64 -t nexusquery:latest .
```

### Multi-Service Orchestration

The `docker-compose.yml` includes:
- FastAPI application
- PostgreSQL database
- Neo4j graph database
- NGINX reverse proxy
```bash
# Start all services
docker-compose up -d

# Scale the API service
docker-compose up -d --scale api=3

# View service status
docker-compose ps

# View aggregated logs
docker-compose logs -f
```

## ☁️ AWS EC2 Deployment

### Deployment Steps
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Clone and deploy
git clone https://github.com/IshanNaikele/NexusQuery-Project.git
cd NexusQuery-Project
docker-compose -f docker-compose.prod.yml up -d
```

### Infrastructure Setup

The application is deployed on AWS EC2 with:
- **Instance Type**: t3.large (2 vCPU, 8GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Web Server**: NGINX (reverse proxy)
- **Application Server**: Gunicorn with 4 workers
- **Security**: Security groups configured for ports 80, 443, 8000

### Accessing the Deployed Application
```bash
# Health check endpoint
curl http://your-ec2-public-ip/health

# API documentation
# Open in browser: http://your-ec2-public-ip/docs
```

## 📊 Performance Benchmarks

Tested on AWS EC2 t3.large (2 vCPU, 8GB RAM):

| Operation | Avg Time | Throughput |
|-----------|----------|------------|
| PDF Ingestion (50 pages) | 8.2s | 6.1 pages/s |
| Web Scraping (10 pages) | 4.5s | 2.2 pages/s |
| SQL Table Index (10K rows) | 45s | 222 rows/s |
| Hybrid Query | 1.8s | - |
| Vector-Only Query | 0.9s | - |
| Keyword-Only Query | 0.4s | - |

## 🧠 Advanced Features

### Reciprocal Rank Fusion (RRF)

RRF combines rankings from multiple retrievers:
```
score(d) = Σ 1 / (k + rank_i(d))
```

Where:
- `d` is a document
- `rank_i(d)` is the rank of document d in retriever i
- `k` is a constant (typically 60)

This provides better results than simple score averaging.

### Knowledge Graph Integration

For entity-rich queries, the system:
1. Extracts entities from the query
2. Queries Neo4j for relationships
3. Uses graph context to enhance retrieval
4. Generates answers with structured reasoning

Example query: "Who are the co-authors of papers with John Doe?"

### Adaptive Query Routing

The system intelligently routes queries:
- **Vector Search**: For semantic/conceptual queries
- **Keyword Search**: For exact term matching
- **Hybrid (RRF)**: For balanced retrieval (default)
- **Knowledge Graph**: For relationship queries

## 🛠️ Tech Stack

### Core Framework
- **FastAPI**: High-performance async web framework
- **LangChain**: LLM orchestration and RAG pipelines
- **Pydantic**: Data validation and settings management

### Search & Retrieval
- **FAISS**: Vector similarity search
- **PostgreSQL**: Full-text search and structured data
- **Neo4j**: Knowledge graph and entity relationships

### LLM & Embeddings
- **OpenAI GPT-4**: Answer generation
- **text-embedding-3-small**: Document embeddings
- **LangChain Expression Language (LCEL)**: Chain composition

### Infrastructure
- **Docker & Docker Compose**: Containerization
- **NGINX**: Reverse proxy and load balancing
- **Gunicorn**: WSGI HTTP Server
- **AWS EC2**: Cloud deployment

### Testing & Quality
- **pytest**: Unit and integration testing
- **pytest-cov**: Code coverage analysis
- **black**: Code formatting
- **flake8**: Linting

## 📈 Roadmap

- [ ] Implement CI/CD pipeline with GitHub Actions
- [ ] Add support for more vector stores (Weaviate, Qdrant)
- [ ] Implement query caching with Redis
- [ ] Add multi-language support
- [ ] Create admin dashboard for system monitoring
- [ ] Implement user authentication and rate limiting
- [ ] Add support for image and audio ingestion
- [ ] Integrate with Hugging Face models for local inference
- [ ] Add real-time websocket streaming for answers

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`pytest`)
- Code is formatted (`black .`)
- Linting passes (`flake8 .`)
- Documentation is updated

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- LangChain community for excellent RAG patterns
- FastAPI for the incredible web framework
- Anthropic and OpenAI for powerful language models
- The open-source community for amazing tools

## 📧 Contact

**Ishan Naikele**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/ishan-naikele-b759562b0/)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=flat&logo=gmail)](mailto:ishannaikele23@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat&logo=github)](https://github.com/IshanNaikele)

Project Link: [https://github.com/IshanNaikele/NexusQuery-Project](https://github.com/IshanNaikele/NexusQuery-Project)

---

<p align="center">Built with ❤️ for demonstrating production-grade AI systems</p>
