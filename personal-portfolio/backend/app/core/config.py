from typing import List, Union, Dict, Any, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator, EmailStr, SecretStr, DirectoryPath
import secrets
from pathlib import Path
from functools import lru_cache
import json

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "portfolio"
    
    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./portfolio.db"
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    
    # Security
    AUTH_TOKEN_HEADER_NAME: str = "Authorization"
    AUTH_TOKEN_HEADER_TYPE: str = "Bearer"
    MIN_PASSWORD_LENGTH: int = 8
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24
    VERIFY_EMAIL_TOKEN_EXPIRE_HOURS: int = 48
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # ML Models
    MODEL_PATH: DirectoryPath = Path("app/ml/models")
    TORCH_DEVICE: str = "cuda"  # or "cpu"
    MODEL_CACHE_TTL: int = 3600  # 1 hour
    BATCH_SIZE: int = 32
    MAX_SEQUENCE_LENGTH: int = 512
    
    # AI Services
    OPENAI_API_KEY: SecretStr = SecretStr("")
    HUGGINGFACE_API_KEY: SecretStr = SecretStr("")
    AI_MODEL_CONFIGS: Dict[str, Any] = {
        "text_generation": {
            "model": "gpt-3.5-turbo",
            "temperature": 0.7,
            "max_tokens": 1000
        },
        "embeddings": {
            "model": "text-embedding-ada-002",
            "batch_size": 100
        }
    }

    # Storage
    UPLOAD_FOLDER: DirectoryPath = Path("uploads")
    MAX_CONTENT_LENGTH: int = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS: set = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
    FILE_UPLOAD_TIMEOUT: int = 300  # 5 minutes
    
    # Cache
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[SecretStr] = None
    REDIS_DB: int = 0
    CACHE_TTL: int = 3600  # 1 hour
    
    # Elasticsearch
    ELASTICSEARCH_HOSTS: List[str] = ["http://localhost:9200"]
    ELASTICSEARCH_USERNAME: Optional[str] = None
    ELASTICSEARCH_PASSWORD: Optional[SecretStr] = None
    ELASTICSEARCH_VERIFY_CERTS: bool = True
    ELASTICSEARCH_INDEX_SETTINGS: Dict[str, Any] = {
        "number_of_shards": 1,
        "number_of_replicas": 1,
        "refresh_interval": "1s"
    }
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: EmailStr = EmailStr("")
    SMTP_PASSWORD: SecretStr = SecretStr("")
    EMAILS_FROM_EMAIL: EmailStr = EmailStr("")
    EMAILS_FROM_NAME: str = ""
    EMAIL_TEMPLATES_DIR: DirectoryPath = Path("app/email-templates")
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[Path] = Path("logs/app.log")
    ENABLE_ACCESS_LOG: bool = True
    
    # Analytics
    ENABLE_ANALYTICS: bool = True
    ANALYTICS_SAMPLING_RATE: float = 1.0
    METRICS_EXPORT_INTERVAL: int = 60  # seconds
    
    # Feature Flags
    FEATURE_FLAGS: Dict[str, bool] = {
        "enable_ai_analysis": True,
        "enable_advanced_search": True,
        "enable_real_time_updates": True
    }

    class Config:
        case_sensitive = True
        env_file = ".env"
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> Any:
            if field_name == "AI_MODEL_CONFIGS":
                return json.loads(raw_val)
            if field_name == "FEATURE_FLAGS":
                return json.loads(raw_val)
            return cls.json_loads(raw_val)

    def get_ml_model_path(self, model_name: str) -> Path:
        """Get the path for a specific ML model."""
        return self.MODEL_PATH / model_name

    def get_email_template_path(self, template_name: str) -> Path:
        """Get the path for a specific email template."""
        return self.EMAIL_TEMPLATES_DIR / template_name

    def is_feature_enabled(self, feature_name: str) -> bool:
        """Check if a feature flag is enabled."""
        return self.FEATURE_FLAGS.get(feature_name, False)

@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    """
    return Settings()
