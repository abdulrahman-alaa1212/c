from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import verify_token
from app.db.session import SessionLocal
from app.models.user import User
from app.services.user_service import UserService
import redis.asyncio as redis
from elasticsearch import AsyncElasticsearch
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_db() -> Generator:
    """
    Get database session.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

async def get_redis() -> Generator:
    """
    Get Redis connection.
    """
    try:
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD.get_secret_value() if settings.REDIS_PASSWORD else None,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        yield redis_client
    finally:
        await redis_client.close()

async def get_elasticsearch() -> Generator:
    """
    Get Elasticsearch client.
    """
    try:
        es_client = AsyncElasticsearch(
            hosts=settings.ELASTICSEARCH_HOSTS,
            basic_auth=(
                settings.ELASTICSEARCH_USERNAME,
                settings.ELASTICSEARCH_PASSWORD.get_secret_value() if settings.ELASTICSEARCH_PASSWORD else None
            ),
            verify_certs=settings.ELASTICSEARCH_VERIFY_CERTS
        )
        yield es_client
    finally:
        await es_client.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Get current authenticated user.
    """
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_service = UserService(db)
    user = user_service.get(int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current admin user.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

class RateLimitDependency:
    """
    Rate limiting dependency.
    """
    def __init__(self, requests: int = None, window: int = None):
        self.requests = requests or settings.RATE_LIMIT_REQUESTS
        self.window = window or settings.RATE_LIMIT_WINDOW

    async def __call__(
        self,
        redis_client: redis.Redis = Depends(get_redis),
        current_user: Optional[User] = Depends(get_current_user)
    ):
        # Use IP for anonymous users, user ID for authenticated users
        key = f"rate_limit:{current_user.id if current_user else 'anonymous'}"
        
        # Get current request count
        requests = await redis_client.get(key)
        if requests is None:
            await redis_client.setex(key, self.window, 1)
        elif int(requests) >= self.requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests"
            )
        else:
            await redis_client.incr(key)

class FeatureFlagDependency:
    """
    Feature flag dependency.
    """
    def __init__(self, feature_name: str):
        self.feature_name = feature_name

    def __call__(self):
        if not settings.is_feature_enabled(self.feature_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature {self.feature_name} is not enabled"
            )
        return True

# Commonly used dependencies
db = Depends(get_db)
current_user = Depends(get_current_user)
current_active_user = Depends(get_current_active_user)
current_admin_user = Depends(get_current_admin_user)
rate_limit = RateLimitDependency()
redis_client = Depends(get_redis)
es_client = Depends(get_elasticsearch)
