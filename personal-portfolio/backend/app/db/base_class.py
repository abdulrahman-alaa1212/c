from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy import Column, Integer, DateTime
from datetime import datetime
import inflect

# Initialize inflect engine for pluralization
p = inflect.engine()

@as_declarative()
class Base:
    """
    Base class for all database models.
    Provides common functionality and attributes.
    """
    id: Any
    __name__: str
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Generate table name automatically from class name.
        Converts CamelCase to snake_case and pluralizes.
        Example: UserProfile -> user_profiles
        """
        # Convert camel case to snake case
        name = cls.__name__
        snake_case = ''.join(
            ['_' + c.lower() if c.isupper() else c for c in name]
        ).lstrip('_')
        
        # Pluralize
        return p.plural(snake_case)
    
    def to_dict(self) -> dict:
        """
        Convert model instance to dictionary.
        """
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def update(self, **kwargs):
        """
        Update model instance with given kwargs.
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Base':
        """
        Create model instance from dictionary.
        """
        return cls(**{
            key: value
            for key, value in data.items()
            if hasattr(cls, key)
        })
    
    def __repr__(self) -> str:
        """
        String representation of model instance.
        """
        attrs = []
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                value = value.isoformat()
            attrs.append(f"{column.name}={value}")
        
        return f"{self.__class__.__name__}({', '.join(attrs)})"
