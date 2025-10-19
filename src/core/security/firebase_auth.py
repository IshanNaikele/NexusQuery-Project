import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from typing import Optional, Dict, Any 

# Import custom application settings (assumed to be correct path)
from src.core.config import settings

# Configure logging for this module
logger = logging.getLogger(__name__)

# --- 1. FIREBASE INITIALIZATION ---

def initialize_firebase() -> bool:
    """
    Initializes the Firebase Admin SDK using the service account file path.
    Ensures initialization is done only once.
    """
    try:
        # Check if the Firebase app has already been initialized
        if not firebase_admin._apps:
            cred = credentials.Certificate(str(settings.FIREBASE_SERVICE_ACCOUNT_PATH))
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin SDK initialized successfully.")
        return True
    
    except FileNotFoundError:
        logger.error(f"Firebase JSON key not found at: {settings.FIREBASE_SERVICE_ACCOUNT_PATH}")
        raise RuntimeError("Firebase initialization failed: JSON file not found.")
    
    except Exception as e:
        logger.error(f"Firebase initialization failed: {e}")
        raise RuntimeError(f"Firebase initialization failed: {e}")

# --- 2. AUTHENTICATION DEPENDENCY (JWT Verification) ---

# Defines the scheme for extracting the Bearer token from the 'Authorization' header
oauth2_scheme = HTTPBearer(auto_error=False) 

async def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    FastAPI Dependency: Verifies the Firebase ID Token submitted in the 'Bearer' header.
    
    This function is the core of your security. It validates the token provided 
    by the client after they successfully log in via Google or Email/OTP.
    
    Returns:
        dict: The decoded token payload (user claims) on success.
    """
    # Safeguard: Ensure Firebase is initialized
    if not firebase_admin._apps:
        initialize_firebase() 

    # Check for missing credentials (i.e., no token provided at all)
    if not credentials:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Bearer token missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    id_token = credentials.credentials # Extracts the actual JWT string
    
    try:
        # Verify token signature, expiration, and issuer using Firebase SDK
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
        
    except firebase_admin.exceptions.InvalidArgumentError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- 3. HELPER DEPENDENCY (Simple User ID Extraction) ---

async def get_current_user_id(token_data: Dict[str, Any] = Depends(verify_token)) -> str:
    """
    FastAPI Dependency: Ensures the user is authenticated and returns their Firebase UID.
    This is the simplest dependency to use in your protected API routes.
    """
    return token_data['uid']

# Define a simple alias for use in routes
AuthenticatedUser = get_current_user_id
