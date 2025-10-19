from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, field_validator
import firebase_admin
from firebase_admin import auth as firebase_auth
import logging
from typing import Optional

from src.core.security.firebase_auth import (
    initialize_firebase,
    verify_token,
    AuthenticatedUser
)

logger = logging.getLogger(__name__)

initialize_firebase()

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- PYDANTIC MODELS ---

class UserStatusResponse(BaseModel):
    """Response model for the status check endpoint."""
    message: str
    firebase_uid: str
    email: Optional[str] = None
    email_verified: bool
    role: str = "user" 

class EmailRequest(BaseModel):
    """Model for simple email submission (used for resending verification)."""
    email: EmailStr

class EmailPasswordRequest(BaseModel):
    """Model for email and password submission with validation."""
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

# --- ENDPOINTS ---

# 1. EMAIL/PASSWORD SIGN-UP ENDPOINT 

@auth_router.post("/signup", status_code=status.HTTP_201_CREATED)
async def email_signup(request: EmailPasswordRequest):
    """
    Creates a user in Firebase and sends the standard email verification link.
    """
    try:
        # 1. Create user in Firebase
        user = firebase_auth.create_user(
            email=request.email,
            password=request.password,
            email_verified=False
        )
        
        # 2. Send verification email link
        firebase_auth.generate_email_verification_link(request.email)

        logger.info(f"User created and verification email sent for: {request.email}")
        
        return {
            "status": "success",
            "message": f"Account created. Verification link sent to {request.email}. Please verify your email.",
            "uid": user.uid
        }
        
    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please sign in."
        )
    except firebase_auth.WeakPasswordError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is too weak. Use at least 6 characters with mix of letters and numbers."
        )
    except firebase_auth.InvalidEmailError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )
    except Exception as e:
        logger.error(f"Sign-up error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sign-up failed: {str(e)}"
        )

# 2. SEND VERIFICATION EMAIL ENDPOINT

@auth_router.post("/send-verification-email")
async def send_verification_email(request: EmailRequest):
    """
    Resends the email verification link to an existing user.
    """
    try:
        firebase_auth.get_user_by_email(request.email)
        firebase_auth.generate_email_verification_link(request.email)
        
        logger.info(f"Verification email resent for: {request.email}")
        
        return {
            "status": "success",
            "message": "Verification email resent. Please check your inbox."
        }
    except firebase_auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    except Exception as e:
        logger.error(f"Resend verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to resend email: {str(e)}"
        )

# 3. USER STATUS ENDPOINT (Protected)

@auth_router.get("/status", response_model=UserStatusResponse)
async def get_user_status(token_data: dict = Depends(verify_token)):
    """
    Protected endpoint: Verifies the client's Firebase ID Token (JWT).
    Works for Google Sign-in and Email/Password Sign-in.
    """
    return UserStatusResponse(
        message="✓ Token is valid and user is authenticated.",
        firebase_uid=token_data.get('uid'),
        email=token_data.get('email'),
        email_verified=token_data.get('email_verified', False),
        role=token_data.get('role', 'user')
    )

# 4. LOGOUT ENDPOINT (Revoke Token)

@auth_router.post("/logout")
async def logout(uid: str = Depends(AuthenticatedUser)):
    """
    Logout endpoint: Revokes all refresh tokens for the user ID provided by the valid token.
    """
    try:
        firebase_auth.revoke_refresh_tokens(uid)
        logger.info(f"User {uid} logged out successfully")
        return {
            "status": "success",
            "message": "Logged out successfully. All sessions revoked."
        }
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed."
        )