from sqlalchemy import Boolean, Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.core.security import get_password_hash, verify_password
from datetime import datetime
from typing import Optional

class User(Base):
    """
    User model for authentication and profile information.
    """
    # Authentication fields
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # Profile fields
    full_name = Column(String(255))
    bio = Column(Text)
    avatar_url = Column(String(255))
    social_links = Column(JSON)
    
    # Verification
    is_email_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime)
    verification_token = Column(String(255))
    
    # Password reset
    password_reset_token = Column(String(255))
    password_reset_at = Column(DateTime)
    
    # Security
    last_login = Column(DateTime)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    
    # Preferences
    preferences = Column(JSON)
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    researches = relationship("Research", back_populates="author")
    comments = relationship("Comment", back_populates="author")
    notifications = relationship("Notification", back_populates="user")
    
    def __init__(self, **kwargs):
        # Remove password from kwargs and hash it
        password = kwargs.pop('password', None)
        super().__init__(**kwargs)
        if password:
            self.set_password(password)
    
    def set_password(self, password: str) -> None:
        """
        Set hashed password.
        """
        self.hashed_password = get_password_hash(password)
    
    def verify_password(self, password: str) -> bool:
        """
        Verify password against hashed password.
        """
        return verify_password(password, self.hashed_password)
    
    def update_last_login(self) -> None:
        """
        Update last login timestamp.
        """
        self.last_login = datetime.utcnow()
    
    def record_login_attempt(self, success: bool) -> None:
        """
        Record login attempt and handle failed attempts.
        """
        if success:
            self.failed_login_attempts = 0
            self.locked_until = None
            self.update_last_login()
        else:
            self.failed_login_attempts += 1
            if self.failed_login_attempts >= 5:
                self.locked_until = datetime.utcnow() + timedelta(minutes=15)
    
    def is_locked(self) -> bool:
        """
        Check if account is locked due to failed login attempts.
        """
        if self.locked_until and self.locked_until > datetime.utcnow():
            return True
        return False
    
    def verify_email(self, token: str) -> bool:
        """
        Verify email with token.
        """
        if self.verification_token == token:
            self.is_email_verified = True
            self.email_verified_at = datetime.utcnow()
            self.verification_token = None
            return True
        return False
    
    def set_password_reset_token(self, token: str) -> None:
        """
        Set password reset token.
        """
        self.password_reset_token = token
        self.password_reset_at = datetime.utcnow()
    
    def verify_password_reset_token(self, token: str) -> bool:
        """
        Verify password reset token.
        """
        if not self.password_reset_token or not self.password_reset_at:
            return False
        
        # Check if token is expired (24 hours)
        if datetime.utcnow() - self.password_reset_at > timedelta(hours=24):
            return False
        
        return self.password_reset_token == token
    
    def update_profile(self, **kwargs) -> None:
        """
        Update user profile fields.
        """
        allowed_fields = {
            'full_name', 'bio', 'avatar_url',
            'social_links', 'preferences'
        }
        
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(self, field, value)
    
    def to_dict(self) -> dict:
        """
        Convert user to dictionary (exclude sensitive fields).
        """
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'social_links': self.social_links,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'is_email_verified': self.is_email_verified,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'preferences': self.preferences,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
