from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, Table, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from typing import List, Optional, Dict, Any
from datetime import datetime

# Association tables
project_tag = Table(
    'project_tag',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

project_category = Table(
    'project_category',
    Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

class Project(Base):
    """
    Project model for portfolio projects.
    """
    # Basic information
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text)
    status = Column(String(50), default='draft')  # draft, published, archived
    
    # Technical details
    technologies = Column(JSON)  # List of technologies used
    github_url = Column(String(255))
    demo_url = Column(String(255))
    documentation_url = Column(String(255))
    
    # Media
    thumbnail_url = Column(String(255))
    images = Column(JSON)  # List of image URLs
    video_url = Column(String(255))
    
    # Metrics
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    featured_score = Column(Float, default=0.0)
    
    # Analysis results
    technical_analysis = Column(JSON)
    impact_analysis = Column(JSON)
    market_analysis = Column(JSON)
    
    # Ownership and collaboration
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    collaborators = Column(JSON)  # List of collaborator details
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    tags = relationship("Tag", secondary=project_tag, back_populates="projects")
    categories = relationship(
        "Category",
        secondary=project_category,
        back_populates="projects"
    )
    comments = relationship("Comment", back_populates="project")
    analytics = relationship("Analytics", back_populates="project")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.technologies = kwargs.get('technologies', [])
        self.images = kwargs.get('images', [])
        self.collaborators = kwargs.get('collaborators', [])
        self.technical_analysis = {}
        self.impact_analysis = {}
        self.market_analysis = {}
    
    def update_metrics(self, views_delta: int = 0, likes_delta: int = 0) -> None:
        """
        Update project metrics.
        """
        self.views += views_delta
        self.likes += likes_delta
        self._calculate_featured_score()
    
    def _calculate_featured_score(self) -> None:
        """
        Calculate featured score based on various metrics.
        """
        # Base score from views and likes
        view_weight = 0.4
        like_weight = 0.6
        
        # Normalize views and likes (assuming 1000 views or 100 likes is "good")
        normalized_views = min(self.views / 1000, 1.0)
        normalized_likes = min(self.likes / 100, 1.0)
        
        # Calculate base score
        base_score = (
            normalized_views * view_weight +
            normalized_likes * like_weight
        )
        
        # Adjust score based on other factors
        completeness_bonus = self._calculate_completeness_bonus()
        recency_factor = self._calculate_recency_factor()
        
        # Combine all factors
        self.featured_score = base_score * completeness_bonus * recency_factor
    
    def _calculate_completeness_bonus(self) -> float:
        """
        Calculate bonus factor based on project completeness.
        """
        completeness_factors = [
            bool(self.description),
            bool(self.content),
            bool(self.thumbnail_url),
            bool(self.github_url),
            bool(self.demo_url),
            bool(self.technologies),
            len(self.images) > 0,
            bool(self.documentation_url)
        ]
        
        completeness_ratio = sum(completeness_factors) / len(completeness_factors)
        return 1.0 + (completeness_ratio * 0.5)  # Up to 50% bonus
    
    def _calculate_recency_factor(self) -> float:
        """
        Calculate recency factor based on last update.
        """
        days_since_update = (
            datetime.utcnow() - self.updated_at
        ).days
        
        # Decay factor over time (slower decay for first 90 days)
        if days_since_update <= 90:
            return 1.0
        else:
            return max(0.5, 1.0 - ((days_since_update - 90) / 365))
    
    def analyze_project(self) -> None:
        """
        Perform technical, impact, and market analysis.
        """
        self.technical_analysis = self._analyze_technical_aspects()
        self.impact_analysis = self._analyze_impact()
        self.market_analysis = self._analyze_market_potential()
    
    def _analyze_technical_aspects(self) -> Dict[str, Any]:
        """
        Analyze technical aspects of the project.
        """
        return {
            'complexity_score': self._calculate_complexity_score(),
            'technology_stack': self._analyze_technology_stack(),
            'code_quality': self._estimate_code_quality()
        }
    
    def _analyze_impact(self) -> Dict[str, Any]:
        """
        Analyze project impact.
        """
        return {
            'social_impact': self._calculate_social_impact(),
            'innovation_score': self._calculate_innovation_score(),
            'scalability': self._assess_scalability()
        }
    
    def _analyze_market_potential(self) -> Dict[str, Any]:
        """
        Analyze market potential.
        """
        return {
            'market_size': self._estimate_market_size(),
            'competition': self._analyze_competition(),
            'monetization_potential': self._assess_monetization()
        }
    
    def to_dict(self) -> dict:
        """
        Convert project to dictionary.
        """
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'content': self.content,
            'status': self.status,
            'technologies': self.technologies,
            'github_url': self.github_url,
            'demo_url': self.demo_url,
            'documentation_url': self.documentation_url,
            'thumbnail_url': self.thumbnail_url,
            'images': self.images,
            'video_url': self.video_url,
            'views': self.views,
            'likes': self.likes,
            'featured_score': self.featured_score,
            'technical_analysis': self.technical_analysis,
            'impact_analysis': self.impact_analysis,
            'market_analysis': self.market_analysis,
            'owner_id': self.owner_id,
            'collaborators': self.collaborators,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"<Project {self.title}>"
