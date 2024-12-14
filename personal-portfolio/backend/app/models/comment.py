from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from typing import List, Optional
from datetime import datetime

class Comment(Base):
    """
    Comment model for projects and research papers.
    """
    # Content
    content = Column(Text, nullable=False)
    formatted_content = Column(Text)  # HTML formatted content
    
    # Metadata
    status = Column(String(20), default='published')  # published, hidden, deleted
    ip_address = Column(String(45))  # IPv4 or IPv6 address
    user_agent = Column(String(255))
    sentiment_score = Column(Float)
    spam_score = Column(Float, default=0.0)
    is_spam = Column(Boolean, default=False)
    
    # Relations
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    parent_id = Column(Integer, ForeignKey('comments.id'), nullable=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)
    research_id = Column(Integer, ForeignKey('researches.id'), nullable=True)
    
    # Metrics
    likes = Column(Integer, default=0)
    reports = Column(Integer, default=0)
    
    # Extra data
    metadata = Column(JSON)
    
    # Relationships
    author = relationship("User", back_populates="comments")
    parent = relationship(
        "Comment",
        remote_side=[id],
        backref="replies"
    )
    project = relationship("Project", back_populates="comments")
    research = relationship("Research", back_populates="comments")
    
    def __init__(self, **kwargs):
        self.metadata = kwargs.pop('metadata', {})
        super().__init__(**kwargs)
        self._format_content()
        self._analyze_sentiment()
        self._check_spam()
    
    def _format_content(self) -> None:
        """
        Format comment content to HTML.
        """
        import markdown
        import bleach
        
        # Convert markdown to HTML
        html = markdown.markdown(self.content)
        
        # Sanitize HTML
        allowed_tags = [
            'p', 'br', 'strong', 'em', 'u', 'code',
            'pre', 'blockquote', 'ul', 'ol', 'li', 'a'
        ]
        allowed_attrs = {
            'a': ['href', 'title', 'target'],
            'code': ['class'],
            'pre': ['class']
        }
        
        self.formatted_content = bleach.clean(
            html,
            tags=allowed_tags,
            attributes=allowed_attrs,
            strip=True
        )
    
    def _analyze_sentiment(self) -> None:
        """
        Analyze comment sentiment.
        """
        from textblob import TextBlob
        
        analysis = TextBlob(self.content)
        self.sentiment_score = analysis.sentiment.polarity
    
    def _check_spam(self) -> None:
        """
        Check if comment is spam.
        """
        # Implement spam detection logic here
        # This is a simple example - you should use more sophisticated methods
        spam_indicators = [
            len(self.content) > 1000,  # Too long
            self.content.count('http') > 2,  # Too many links
            self.content.isupper(),  # ALL CAPS
            any(word in self.content.lower() 
                for word in ['viagra', 'casino', 'buy now'])
        ]
        
        self.spam_score = sum(spam_indicators) / len(spam_indicators)
        self.is_spam = self.spam_score > 0.5
    
    def get_thread(self) -> List['Comment']:
        """
        Get full comment thread (parent and all replies).
        """
        thread = []
        
        # Add parent if exists
        if self.parent:
            thread.append(self.parent)
        
        # Add this comment
        thread.append(self)
        
        # Add replies recursively
        thread.extend(self._get_replies_recursive())
        
        return thread
    
    def _get_replies_recursive(self) -> List['Comment']:
        """
        Get all replies recursively.
        """
        replies = []
        for reply in self.replies:
            replies.append(reply)
            replies.extend(reply._get_replies_recursive())
        return replies
    
    def get_reply_count(self) -> int:
        """
        Get total number of replies.
        """
        return len(self._get_replies_recursive())
    
    def update_metrics(self, likes_delta: int = 0, reports_delta: int = 0) -> None:
        """
        Update comment metrics.
        """
        self.likes += likes_delta
        self.reports += reports_delta
        
        # Auto-hide comment if too many reports
        if self.reports >= 5:
            self.status = 'hidden'
    
    def mark_as_spam(self) -> None:
        """
        Mark comment as spam.
        """
        self.is_spam = True
        self.status = 'hidden'
        self.metadata['spam_detected_at'] = datetime.utcnow().isoformat()
    
    def restore(self) -> None:
        """
        Restore hidden or deleted comment.
        """
        self.status = 'published'
        self.is_spam = False
        self.reports = 0
    
    def soft_delete(self) -> None:
        """
        Soft delete comment.
        """
        self.status = 'deleted'
        self.content = '[Comment deleted]'
        self.formatted_content = '<p>[Comment deleted]</p>'
    
    def to_dict(self) -> dict:
        """
        Convert comment to dictionary.
        """
        return {
            'id': self.id,
            'content': self.content,
            'formatted_content': self.formatted_content,
            'status': self.status,
            'author_id': self.author_id,
            'parent_id': self.parent_id,
            'project_id': self.project_id,
            'research_id': self.research_id,
            'likes': self.likes,
            'reports': self.reports,
            'sentiment_score': self.sentiment_score,
            'is_spam': self.is_spam,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"<Comment {self.id} by User {self.author_id}>"
