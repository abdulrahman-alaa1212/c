from sqlalchemy import Column, String, Text, Integer, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Category(Base):
    """
    Category model for organizing projects and research.
    """
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text)
    icon = Column(String(255))  # Icon URL or class name
    color = Column(String(7))  # Hex color code
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    
    # Relationships
    parent = relationship("Category", remote_side=[id], backref="subcategories")
    projects = relationship(
        "Project",
        secondary="project_category",
        back_populates="categories"
    )
    researches = relationship(
        "Research",
        secondary="research_category",
        back_populates="categories"
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
    
    def get_hierarchy(self) -> List[str]:
        """
        Get category hierarchy as list of names.
        """
        hierarchy = [self.name]
        current = self
        
        while current.parent:
            current = current.parent
            hierarchy.append(current.name)
        
        return list(reversed(hierarchy))
    
    def get_all_subcategories(self) -> List['Category']:
        """
        Get all subcategories recursively.
        """
        all_subcategories = []
        for subcategory in self.subcategories:
            all_subcategories.append(subcategory)
            all_subcategories.extend(subcategory.get_all_subcategories())
        return all_subcategories
    
    def get_root_category(self) -> 'Category':
        """
        Get the root category in the hierarchy.
        """
        current = self
        while current.parent:
            current = current.parent
        return current
    
    def is_descendant_of(self, category: 'Category') -> bool:
        """
        Check if this category is a descendant of the given category.
        """
        current = self
        while current.parent:
            if current.parent == category:
                return True
            current = current.parent
        return False
    
    def get_siblings(self) -> List['Category']:
        """
        Get sibling categories (categories with the same parent).
        """
        if self.parent:
            return [
                cat for cat in self.parent.subcategories
                if cat != self
            ]
        return []
    
    def move_to_parent(self, new_parent: Optional['Category']) -> None:
        """
        Move category to a new parent.
        """
        if new_parent and new_parent.is_descendant_of(self):
            raise ValueError("Cannot move category to its own descendant")
        self.parent = new_parent
    
    def to_dict(self) -> dict:
        """
        Convert category to dictionary.
        """
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'is_active': self.is_active,
            'display_order': self.display_order,
            'parent_id': self.parent_id,
            'hierarchy': self.get_hierarchy(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"<Category {self.name}>"
