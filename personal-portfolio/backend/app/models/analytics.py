from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import json

class Analytics(Base):
    """
    Analytics model for tracking project and research metrics.
    """
    # Relations
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)
    research_id = Column(Integer, ForeignKey('researches.id'), nullable=True)
    
    # Time periods
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Traffic metrics
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    avg_time_on_page = Column(Float, default=0.0)
    bounce_rate = Column(Float, default=0.0)
    
    # Engagement metrics
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    
    # Geographic data
    country_distribution = Column(JSON)  # {country_code: count}
    city_distribution = Column(JSON)     # {city: count}
    
    # Device data
    device_distribution = Column(JSON)   # {device_type: count}
    browser_distribution = Column(JSON)  # {browser: count}
    os_distribution = Column(JSON)       # {os: count}
    
    # Referrer data
    referrer_distribution = Column(JSON) # {referrer: count}
    
    # Custom events
    events = Column(JSON)  # {event_name: count}
    
    # Performance metrics
    avg_load_time = Column(Float)
    error_count = Column(Integer, default=0)
    
    # Relationships
    project = relationship("Project", back_populates="analytics")
    research = relationship("Research", back_populates="analytics")
    
    def __init__(self, **kwargs):
        # Initialize JSON fields
        self.country_distribution = {}
        self.city_distribution = {}
        self.device_distribution = {}
        self.browser_distribution = {}
        self.os_distribution = {}
        self.referrer_distribution = {}
        self.events = {}
        super().__init__(**kwargs)
    
    @classmethod
    def create_daily(
        cls,
        project_id: Optional[int] = None,
        research_id: Optional[int] = None,
        date: Optional[datetime] = None
    ) -> 'Analytics':
        """
        Create analytics entry for a specific day.
        """
        date = date or datetime.utcnow()
        start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        
        return cls(
            project_id=project_id,
            research_id=research_id,
            period_start=start,
            period_end=end
        )
    
    def record_pageview(
        self,
        visitor_id: str,
        duration: float = 0,
        is_bounce: bool = False,
        metadata: Dict[str, Any] = None
    ) -> None:
        """
        Record a page view with associated metrics.
        """
        metadata = metadata or {}
        
        # Update basic metrics
        self.page_views += 1
        self.unique_visitors = len(set(self.get_visitor_ids() + [visitor_id]))
        
        # Update time on page
        if duration > 0:
            current_total = self.avg_time_on_page * (self.page_views - 1)
            self.avg_time_on_page = (current_total + duration) / self.page_views
        
        # Update bounce rate
        if is_bounce:
            current_bounces = self.bounce_rate * (self.page_views - 1)
            self.bounce_rate = (current_bounces + 1) / self.page_views
        
        # Update distributions
        self._update_distribution('country_distribution', metadata.get('country'))
        self._update_distribution('city_distribution', metadata.get('city'))
        self._update_distribution('device_distribution', metadata.get('device'))
        self._update_distribution('browser_distribution', metadata.get('browser'))
        self._update_distribution('os_distribution', metadata.get('os'))
        self._update_distribution('referrer_distribution', metadata.get('referrer'))
    
    def record_event(self, event_name: str, metadata: Dict[str, Any] = None) -> None:
        """
        Record a custom event.
        """
        self.events = self.events or {}
        if event_name not in self.events:
            self.events[event_name] = {
                'count': 0,
                'metadata': []
            }
        
        self.events[event_name]['count'] += 1
        if metadata:
            self.events[event_name]['metadata'].append(metadata)
    
    def record_error(self, error_type: str, metadata: Dict[str, Any] = None) -> None:
        """
        Record an error occurrence.
        """
        self.error_count += 1
        self.record_event(f"error_{error_type}", metadata)
    
    def update_performance_metrics(self, load_time: float) -> None:
        """
        Update performance metrics.
        """
        if not self.avg_load_time:
            self.avg_load_time = load_time
        else:
            self.avg_load_time = (self.avg_load_time + load_time) / 2
    
    def get_visitor_ids(self) -> List[str]:
        """
        Get list of unique visitor IDs.
        """
        # This should be implemented based on your visitor tracking system
        return []
    
    def _update_distribution(self, field_name: str, value: str) -> None:
        """
        Update a distribution field with a new value.
        """
        if not value:
            return
        
        distribution = getattr(self, field_name) or {}
        distribution[value] = distribution.get(value, 0) + 1
        setattr(self, field_name, distribution)
    
    def get_top_items(
        self,
        distribution_name: str,
        limit: int = 10
    ) -> List[tuple]:
        """
        Get top items from a distribution.
        """
        distribution = getattr(self, distribution_name) or {}
        sorted_items = sorted(
            distribution.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_items[:limit]
    
    def to_dict(self) -> dict:
        """
        Convert analytics to dictionary.
        """
        return {
            'id': self.id,
            'project_id': self.project_id,
            'research_id': self.research_id,
            'period_start': self.period_start.isoformat(),
            'period_end': self.period_end.isoformat(),
            'page_views': self.page_views,
            'unique_visitors': self.unique_visitors,
            'avg_time_on_page': self.avg_time_on_page,
            'bounce_rate': self.bounce_rate,
            'likes': self.likes,
            'comments': self.comments,
            'shares': self.shares,
            'downloads': self.downloads,
            'country_distribution': self.country_distribution,
            'city_distribution': self.city_distribution,
            'device_distribution': self.device_distribution,
            'browser_distribution': self.browser_distribution,
            'os_distribution': self.os_distribution,
            'referrer_distribution': self.referrer_distribution,
            'events': self.events,
            'avg_load_time': self.avg_load_time,
            'error_count': self.error_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        entity_type = "Project" if self.project_id else "Research"
        entity_id = self.project_id or self.research_id
        return f"<Analytics for {entity_type} {entity_id}>"
