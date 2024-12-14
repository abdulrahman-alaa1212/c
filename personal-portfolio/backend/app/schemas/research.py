from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
import json

class ResearchBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    abstract: Optional[str] = Field(None, max_length=2000)
    content: Optional[str] = Field(None)
    status: str = Field("draft", regex="^(draft|published|under_review)$")
    keywords: Optional[List[str]] = Field(default_factory=list)
    authors: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    doi: Optional[str] = None

    @validator('keywords')
    def validate_keywords(cls, v):
        if v and len(v) > 10:
            raise ValueError('Maximum 10 keywords allowed')
        return v

    @validator('authors')
    def validate_authors(cls, v):
        if v:
            required_fields = {'name', 'affiliation'}
            for author in v:
                if not all(field in author for field in required_fields):
                    raise ValueError(
                        f'Each author must have fields: {required_fields}'
                    )
        return v

class ResearchCreate(ResearchBase):
    category_ids: Optional[List[int]] = Field(default_factory=list)
    project_ids: Optional[List[int]] = Field(default_factory=list)

    class Config:
        schema_extra = {
            "example": {
                "title": "Advanced Machine Learning Techniques",
                "abstract": "This research explores...",
                "content": "Detailed research content...",
                "status": "draft",
                "keywords": ["ML", "AI", "Deep Learning"],
                "authors": [
                    {
                        "name": "John Doe",
                        "affiliation": "University of Technology"
                    }
                ],
                "doi": "10.1234/example.doi",
                "category_ids": [1, 2],
                "project_ids": [1]
            }
        }

class ResearchUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    abstract: Optional[str] = Field(None, max_length=2000)
    content: Optional[str] = None
    status: Optional[str] = Field(None, regex="^(draft|published|under_review)$")
    keywords: Optional[List[str]] = None
    authors: Optional[List[Dict[str, str]]] = None
    doi: Optional[str] = None
    category_ids: Optional[List[int]] = None
    project_ids: Optional[List[int]] = None

    @validator('keywords')
    def validate_keywords(cls, v):
        if v and len(v) > 10:
            raise ValueError('Maximum 10 keywords allowed')
        return v

    @validator('authors')
    def validate_authors(cls, v):
        if v:
            required_fields = {'name', 'affiliation'}
            for author in v:
                if not all(field in author for field in required_fields):
                    raise ValueError(
                        f'Each author must have fields: {required_fields}'
                    )
        return v

class AnalysisResult(BaseModel):
    content_quality: Dict[str, float]
    novelty: Dict[str, float]
    methodology: Dict[str, Any]
    impact_potential: Dict[str, float]
    overall_score: float

class TopicDistribution(BaseModel):
    topic_id: str
    words: List[str]
    weight: float

class ResearchResponse(ResearchBase):
    id: int
    created_at: datetime
    updated_at: datetime
    citations: int = 0
    impact_factor: Optional[float] = None
    h_index: Optional[float] = None
    analysis_results: Optional[AnalysisResult] = None
    topic_distribution: Optional[Dict[str, TopicDistribution]] = None
    pdf_url: Optional[str] = None

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    @validator('analysis_results', pre=True)
    def validate_analysis_results(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @validator('topic_distribution', pre=True)
    def validate_topic_distribution(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

class CitationMetrics(BaseModel):
    total_citations: int
    h_index: Optional[float]
    impact_factor: Optional[float]
    citations_per_year: Dict[int, int]

class SimilarResearchResponse(BaseModel):
    research: ResearchResponse
    similarity_score: float
