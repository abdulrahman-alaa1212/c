from sqlalchemy import Column, Integer, String, Text, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime
from typing import Optional, Dict, Any

class Notification(Base):
    """
    Notification model for user notifications.
    """
    # Basic fields
    title = Column(String(255), nullable=False)
    content = Column(Text)
    type = Column(String(50), nullable=False)  # email, in-app, push
    priority = Column(String(20), default='normal')  # low, normal, high, urgent
    status = Column(String(20), default='unread')  # unread, read, archived
    
    # Recipients
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Related entities
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)
    research_id = Column(Integer, ForeignKey('researches.id'), nullable=True)
    comment_id = Column(Integer, ForeignKey('comments.id'), nullable=True)
    
    # Delivery status
    is_delivered = Column(Boolean, default=False)
    delivered_at = Column(DateTime)
    read_at = Column(DateTime)
    
    # Extra data
    metadata = Column(JSON)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    project = relationship("Project")
    research = relationship("Research")
    comment = relationship("Comment")
    
    def __init__(self, **kwargs):
        self.metadata = kwargs.pop('metadata', {})
        super().__init__(**kwargs)
    
    def mark_as_delivered(self) -> None:
        """
        Mark notification as delivered.
        """
        self.is_delivered = True
        self.delivered_at = datetime.utcnow()
        self._update_metadata('delivery_attempts', 1)
    
    def mark_as_read(self) -> None:
        """
        Mark notification as read.
        """
        self.status = 'read'
        self.read_at = datetime.utcnow()
    
    def archive(self) -> None:
        """
        Archive notification.
        """
        self.status = 'archived'
        self._update_metadata('archived_at', datetime.utcnow().isoformat())
    
    def _update_metadata(self, key: str, value: Any) -> None:
        """
        Update metadata field.
        """
        self.metadata = self.metadata or {}
        
        if key in self.metadata and isinstance(self.metadata[key], int):
            self.metadata[key] += value
        else:
            self.metadata[key] = value
    
    @property
    def is_read(self) -> bool:
        """
        Check if notification is read.
        """
        return self.status in ['read', 'archived']
    
    @property
    def age_in_hours(self) -> float:
        """
        Get notification age in hours.
        """
        if not self.created_at:
            return 0
        
        delta = datetime.utcnow() - self.created_at
        return delta.total_seconds() / 3600
    
    @property
    def should_resend(self) -> bool:
        """
        Check if notification should be resent based on delivery status and age.
        """
        if self.is_delivered or self.is_read:
            return False
        
        attempts = self.metadata.get('delivery_attempts', 0)
        max_attempts = {
            'urgent': 5,
            'high': 3,
            'normal': 2,
            'low': 1
        }.get(self.priority, 2)
        
        return attempts < max_attempts and self.age_in_hours < 24
    
    def get_template_data(self) -> Dict[str, Any]:
        """
        Get data for notification template rendering.
        """
        data = {
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'priority': self.priority,
            'created_at': self.created_at.isoformat(),
            'metadata': self.metadata
        }
        
        # Add related entity data
        if self.project:
            data['project'] = {
                'id': self.project.id,
                'title': self.project.title
            }
        
        if self.research:
            data['research'] = {
                'id': self.research.id,
                'title': self.research.title
            }
        
        if self.comment:
            data['comment'] = {
                'id': self.comment.id,
                'content': self.comment.content
            }
        
        return data
    
    def to_dict(self) -> dict:
        """
        Convert notification to dictionary.
        """
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'type': self.type,
            'priority': self.priority,
            'status': self.status,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'research_id': self.research_id,
            'comment_id': self.comment_id,
            'is_delivered': self.is_delivered,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"<Notification {self.type}:{self.status} for User {self.user_id}>"
