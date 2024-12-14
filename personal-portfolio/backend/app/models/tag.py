from sqlalchemy import Column, String, Text, Integer, Boolean, Float
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from typing import List
from datetime import datetime

class Tag(Base):
    """
    Tag model for labeling projects and research.
    """
    name = Column(String(50), nullable=False, unique=True)
    slug = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text)
    color = Column(String(7))  # Hex color code
    icon = Column(String(255))  # Icon URL or class name
    is_featured = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    relevance_score = Column(Float, default=0.0)
    
    # Relationships
    projects = relationship(
        "Project",
        secondary="project_tag",
        back_populates="tags"
    )
    researches = relationship(
        "Research",
        secondary="research_tag",
        back_populates="tags"
    )
    
    def __init__(self, **kwargs):
        # Generate slug from name if not provided
        if 'name' in kwargs and 'slug' not in kwargs:
            kwargs['slug'] = self.generate_slug(kwargs['name'])
        super().__init__(**kwargs)
    
    @staticmethod
    def generate_slug(name: str) -> str:
        """
        Generate URL-friendly slug from name.
        """
        # Convert to lowercase and replace spaces with hyphens
        slug = name.lower().replace(' ', '-')
        
        # Remove special characters
        slug = ''.join(c for c in slug if c.isalnum() or c == '-')
        
        # Remove duplicate hyphens
        while '--' in slug:
            slug = slug.replace('--', '-')
        
        # Remove leading/trailing hyphens
        return slug.strip('-')
    
    def update_usage_count(self) -> None:
        """
        Update tag usage count based on relationships.
        """
        self.usage_count = len(self.projects) + len(self.researches)
        self._update_relevance_score()
    
    def _update_relevance_score(self) -> None:
        """
        Update tag relevance score based on various factors.
        """
        # Base score from usage count (logarithmic scale)
        usage_score = min(1.0, self.usage_count / 100)
        
        # Time decay factor
        days_since_update = (datetime.utcnow() - self.updated_at).days
        time_factor = max(0.5, 1.0 - (days_since_update / 365))
        
        # Featured bonus
        featured_bonus = 1.2 if self.is_featured else 1.0
        
        # Combine factors
        self.relevance_score = usage_score * time_factor * featured_bonus
    
    def get_related_tags(self, limit: int = 10) -> List['Tag']:
        """
        Get related tags based on project and research associations.
        """
        related_tags = {}
        
        # Get tags from related projects
        for project in self.projects:
            for tag in project.tags:
                if tag != self:
                    related_tags[tag] = related_tags.get(tag, 0) + 1
        
        # Get tags from related research
        for research in self.researches:
            for tag in research.tags:
                if tag != self:
                    related_tags[tag] = related_tags.get(tag, 0) + 1
        
        # Sort by frequency and return top tags
        sorted_tags = sorted(
            related_tags.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [tag for tag, _ in sorted_tags[:limit]]
    
    def merge_with(self, other_tag: 'Tag') -> None:
        """
        Merge another tag into this one.
        """
        # Update relationships
        self.projects.extend(other_tag.projects)
        self.researches.extend(other_tag.researches)
        
        # Update metadata
        self.usage_count += other_tag.usage_count
        self._update_relevance_score()
        
        # Mark the other tag for deletion
        return other_tag
    
    def split_into(self, new_name: str, project_ids: List[int] = None, research_ids: List[int] = None) -> 'Tag':
        """
        Split tag into a new tag with specified projects and research papers.
        """
        new_tag = Tag(name=new_name)
        
        if project_ids:
            new_tag.projects = [p for p in self.projects if p.id in project_ids]
            self.projects = [p for p in self.projects if p.id not in project_ids]
        
        if research_ids:
            new_tag.researches = [r for r in self.researches if r.id in research_ids]
            self.researches = [r for r in self.researches if r.id not in research_ids]
        
        # Update counts
        self.update_usage_count()
        new_tag.update_usage_count()
        
        return new_tag
    
    def to_dict(self) -> dict:
        """
        Convert tag to dictionary.
        """
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'color': self.color,
            'icon': self.icon,
            'is_featured': self.is_featured,
            'usage_count': self.usage_count,
            'relevance_score': self.relevance_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"<Tag {self.name}>"
