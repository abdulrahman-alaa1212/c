from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, Table
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Research(Base):
    __tablename__ = "researches"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    abstract = Column(Text)
    content = Column(Text)
    publication_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50))  # published, draft, under_review
    
    # Metadata
    keywords = Column(JSON)  # List of keywords
    authors = Column(JSON)  # List of authors
    citations = Column(Integer, default=0)
    doi = Column(String(100))
    
    # Metrics
    impact_factor = Column(Float)
    h_index = Column(Float)
    citation_count = Column(Integer, default=0)
    
    # Relations
    projects = relationship("Project", secondary="research_project_association")
    categories = relationship("Category", secondary="research_category_association")
    
    # ML Analysis Results
    analysis_results = Column(JSON)
    topic_distribution = Column(JSON)
    embedding_vector = Column(JSON)  # For similarity search
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.analysis_results = {}
        self.topic_distribution = {}
        self.embedding_vector = []

    async def analyze_content(self, analyzer):
        """Analyze research content using ML models"""
        self.analysis_results = await analyzer.analyze_research({
            'title': self.title,
            'abstract': self.abstract,
            'content': self.content,
            'keywords': self.keywords
        })
        
        # Update embedding vector for similarity search
        self.embedding_vector = await analyzer.generate_embedding(
            f"{self.title} {self.abstract}"
        )
        
        # Generate topic distribution
        self.topic_distribution = await analyzer.extract_topics(self.content)

    async def calculate_metrics(self):
        """Calculate research metrics"""
        # Implementation for calculating various research metrics
        pass

    async def update_citations(self, citation_service):
        """Update citation count from academic databases"""
        if self.doi:
            self.citations = await citation_service.get_citation_count(self.doi)

    async def find_similar_research(self, similarity_service):
        """Find similar research papers"""
        return await similarity_service.find_similar(self.embedding_vector)

    def to_dict(self):
        """Convert to dictionary with selected fields"""
        return {
            'id': self.id,
            'title': self.title,
            'abstract': self.abstract,
            'publication_date': self.publication_date.isoformat(),
            'status': self.status,
            'keywords': self.keywords,
            'authors': self.authors,
            'citations': self.citations,
            'impact_factor': self.impact_factor,
            'analysis_results': self.analysis_results,
            'topic_distribution': self.topic_distribution
        }
