from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import uvicorn
import os
from src.core.config import settings
from src.core.security.firebase_auth import (
    initialize_firebase,
    AuthenticatedUser,
    # NOTE: 'AdminOnly' removed as it is not used in the simplified architecture.
)
from src.routes.auth_routes import auth_router

# --- 1. INITIAL SETUP ---

logging.basicConfig(
    level=settings.LOG_LEVEL, # Use LOG_LEVEL from settings
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
load_dotenv()
# Initialize Firebase Admin SDK
# Note: This is crucial to be called early in the application lifecycle.
initialize_firebase()

# Create FastAPI app instance
app = FastAPI(
    title="NexusQuery Secure Auth API",
    description="Secured backend using Firebase JWT for Google and Email/Password verification.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# --- 2. MIDDLEWARE: CORS CONFIGURATION ---

# Configure CORS to allow communication with the frontend development server
app.add_middleware(
    CORSMiddleware,
    # Dynamically allow the configured FRONTEND_URL plus common local development ports
    allow_origins=[
        settings.FRONTEND_URL, 
        "http://localhost:3000", 
        "http://localhost:8000",
        "http://127.0.0.1:5500",  # This should work
        "http://127.0.0.1:8000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",   # Add this too
    ],
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers (including Authorization header for JWT)
)

# --- 3. ROUTERS ---

# 3.1. Authentication Router 
app.include_router(auth_router)

# 3.2. Protected Resources Router (Requires Authentication)
protected_router = APIRouter(prefix="/api", tags=["Protected Resources"])

@protected_router.get("/status")
async def get_status(uid: str = Depends(AuthenticatedUser)):
    """
    Protected endpoint check. Any authenticated user can access.
    Returns the UID from the verified token.
    """
    return {
        "status": "success",
        "message": "User is authenticated and token is valid.",
        "user_id": uid,
        "access_level": "Standard User"
    }

@protected_router.get("/query")
async def run_query(uid: str = Depends(AuthenticatedUser)):
    """
    Example Query endpoint - Any authenticated user can access.
    """
    return {
        "status": "success",
        "message": "Query executed successfully.",
        "user_id": uid,
        "results": "Simulated query results based on your user identity."
    }

app.include_router(protected_router)

# --- 4. HEALTH CHECK ---

@app.get("/health")
async def health_check():
    """Health check endpoint to confirm the service is running."""
    return {
        "status": "healthy",
        "service": "NexusQuery Auth Service",
        "version": "1.0.0"
    }

@app.get("/config")
async def get_firebase_config():
    """
    Public endpoint that returns Firebase client config.
    These values are meant to be public (they're visible in compiled apps anyway).
    """
    return {
        "apiKey": os.getenv("FIREBASE_API_KEY"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID"),
    }
# --- 5. ROOT ENDPOINT ---

@app.get("/")
async def root():
    """Root endpoint with API information and current functional routes."""
    return {
        "message": "Welcome to NexusQuery Secure Auth API",
        "endpoints": {
            "signup": "POST /auth/signup (Creates user and sends verification email)",
            "send_verification": "POST /auth/send-verification-email (Resends email link)",
            "status_check": "GET /auth/status (Requires Auth Header)",
            "logout": "POST /auth/logout (Requires Auth Header)",
            "docs": "/api/docs"
        }
    }

if __name__ == "__main__":
    logger.info(f"Starting NexusQuery API on http://0.0.0.0:8000")
    logger.info(f"Docs available at http://localhost:8000/api/docs")
    # uvicorn.run ensures the application starts correctly
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
