from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# --- Path Calculations (Goes to the Root Directory )---
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    """
    Application configuration settings loaded from environment variables (.env file).
    Pydantic automatically validates types and loads values.
    """
    
    # --- Pydantic Configuration ---
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        extra='ignore'
    )
    
    # --- FIREBASE ADMIN SETTINGS (Private) ---
    FIREBASE_SERVICE_ACCOUNT_PATH: Path = BASE_DIR / "firebase_nexusquery.json"
    
    # --- DATABASE SETTINGS ---
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # --- SERVER/APPLICATION SETTINGS ---
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # --- ONE-TIME PASSWORD (OTP) SETTINGS ---
    OTP_EXPIRY_MINUTES: int = 10
    
    # --- CORS (Cross-Origin Resource Sharing) SETTINGS ---
    FRONTEND_URL: str = "http://localhost:3000"
    
    # --- 💡 NEW: FRONTEND/CLIENT CONFIGURATION (Public) ---
    # These values are public and are served to the frontend JavaScript.
    # They should match the fields required by the Firebase Client SDK.
    FIREBASE_CLIENT_API_KEY: str = "AIzaSyC6RkKVki_VmXlv1PXJUkXHBtVOZbfjkQA"
    FIREBASE_AUTH_DOMAIN: str = "nexusquery-b5087.firebaseapp.com"
    FIREBASE_PROJECT_ID: str = "nexusquery-b5087"
    
    # The base URL of the FastAPI backend itself, for the JS fetch calls.
    BACKEND_API_URL: str = "http://localhost:8000"


# --- Initialization ---
settings = Settings()

# Optional: Confirmation message
print("✅ Configuration settings loaded successfully.")