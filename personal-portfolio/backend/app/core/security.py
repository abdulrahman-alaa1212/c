from datetime import datetime, timedelta
from typing import Optional, Union
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.models.user import User
from app.core.config import settings
import magic
import hashlib
from fastapi import UploadFile

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password.
    """
    return pwd_context.hash(password)

def create_access_token(
    subject: Union[str, int],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, int],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT refresh token.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt

def verify_token(token: str) -> dict:
    """
    Verify JWT token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_admin_access(user: User) -> None:
    """
    Verify user has admin access.
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

async def verify_file_safety(file: UploadFile) -> None:
    """
    Verify file safety through multiple checks.
    """
    # Read first 2048 bytes for MIME detection
    header = await file.read(2048)
    await file.seek(0)  # Reset file position
    
    # Check MIME type
    mime = magic.Magic(mime=True)
    file_type = mime.from_buffer(header)
    
    # List of allowed MIME types
    allowed_types = {
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/json',
        'text/markdown'
    }
    
    if file_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_type} not allowed"
        )
    
    # Check file size (10MB limit)
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    file_size = 0
    
    while chunk := await file.read(8192):
        file_size += len(chunk)
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large (max 10MB)"
            )
    
    await file.seek(0)  # Reset file position
    
    # Calculate file hash
    sha256_hash = hashlib.sha256()
    
    while chunk := await file.read(8192):
        sha256_hash.update(chunk)
    
    file_hash = sha256_hash.hexdigest()
    await file.seek(0)  # Reset file position
    
    # Here you could check the file hash against a blacklist
    # or perform additional security checks
    
    # Scan for malware (implement your preferred scanner)
    # await scan_for_malware(file)

def generate_password_reset_token(email: str) -> str:
    """
    Generate password reset token.
    """
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {
        "exp": expire,
        "sub": email,
        "type": "reset"
    }
    
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify password reset token.
    """
    try:
        decoded_token = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        if decoded_token["type"] != "reset":
            return None
        return decoded_token["sub"]
    except JWTError:
        return None

class RateLimiter:
    """
    Simple in-memory rate limiter.
    """
    def __init__(self, max_requests: int, time_window: int):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = {}

    def is_allowed(self, key: str) -> bool:
        now = datetime.utcnow()
        self._cleanup(now)
        
        if key not in self.requests:
            self.requests[key] = []
        
        self.requests[key].append(now)
        
        return len(self.requests[key]) <= self.max_requests

    def _cleanup(self, now: datetime):
        """
        Remove old requests outside the time window.
        """
        cutoff = now - timedelta(seconds=self.time_window)
        
        for key in list(self.requests.keys()):
            self.requests[key] = [
                req for req in self.requests[key]
                if req > cutoff
            ]
            
            if not self.requests[key]:
                del self.requests[key]

# Create rate limiter instance
api_limiter = RateLimiter(max_requests=100, time_window=60)  # 100 requests per minute
