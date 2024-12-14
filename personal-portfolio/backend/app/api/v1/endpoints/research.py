from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.schemas.research import ResearchCreate, ResearchUpdate, ResearchResponse
from app.models.user import User
from app.services.research_service import ResearchService
from app.ml.research_analyzer import ResearchAnalyzer
from app.core.security import verify_admin_access

router = APIRouter()
research_analyzer = ResearchAnalyzer()

@router.get("/", response_model=List[ResearchResponse])
async def get_researches(
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve research papers with optional filtering and search.
    """
    service = ResearchService(db)
    researches = await service.get_multi(
        skip=skip,
        limit=limit,
        category=category,
        search_query=search
    )
    return researches

@router.post("/", response_model=ResearchResponse)
async def create_research(
    research: ResearchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create new research paper with automatic analysis.
    """
    verify_admin_access(current_user)
    service = ResearchService(db)
    
    # Create research entry
    research_obj = await service.create(research)
    
    # Analyze research content
    analysis_result = await research_analyzer.analyze_research({
        'title': research.title,
        'abstract': research.abstract,
        'content': research.content,
        'keywords': research.keywords
    })
    
    # Update research with analysis results
    research_obj = await service.update(
        research_obj.id,
        {'analysis_results': analysis_result}
    )
    
    return research_obj

@router.put("/{research_id}", response_model=ResearchResponse)
async def update_research(
    research_id: int,
    research_update: ResearchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update existing research paper and re-analyze if content changed.
    """
    verify_admin_access(current_user)
    service = ResearchService(db)
    
    # Check if research exists
    existing_research = await service.get(research_id)
    if not existing_research:
        raise HTTPException(status_code=404, detail="Research not found")
    
    # Update research
    updated_research = await service.update(research_id, research_update.dict(exclude_unset=True))
    
    # Re-analyze if content changed
    if any(field in research_update.dict(exclude_unset=True) 
           for field in ['title', 'abstract', 'content']):
        analysis_result = await research_analyzer.analyze_research({
            'title': updated_research.title,
            'abstract': updated_research.abstract,
            'content': updated_research.content,
            'keywords': updated_research.keywords
        })
        updated_research = await service.update(
            research_id,
            {'analysis_results': analysis_result}
        )
    
    return updated_research

@router.delete("/{research_id}")
async def delete_research(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete research paper.
    """
    verify_admin_access(current_user)
    service = ResearchService(db)
    await service.remove(research_id)
    return {"message": "Research deleted successfully"}

@router.post("/{research_id}/upload-pdf")
async def upload_research_pdf(
    research_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload PDF file for research paper.
    """
    verify_admin_access(current_user)
    service = ResearchService(db)
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    pdf_url = await service.upload_pdf(research_id, file)
    return {"pdf_url": pdf_url}

@router.get("/{research_id}/similar")
async def get_similar_research(
    research_id: int,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Find similar research papers based on content analysis.
    """
    service = ResearchService(db)
    similar_papers = await service.find_similar(research_id, limit)
    return similar_papers

@router.get("/{research_id}/citations")
async def get_research_citations(
    research_id: int,
    db: Session = Depends(get_db)
):
    """
    Get citation metrics for research paper.
    """
    service = ResearchService(db)
    citations = await service.get_citations(research_id)
    return citations

@router.post("/{research_id}/analyze")
async def analyze_research_manually(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger research analysis.
    """
    verify_admin_access(current_user)
    service = ResearchService(db)
    
    research = await service.get(research_id)
    if not research:
        raise HTTPException(status_code=404, detail="Research not found")
    
    analysis_result = await research_analyzer.analyze_research({
        'title': research.title,
        'abstract': research.abstract,
        'content': research.content,
        'keywords': research.keywords
    })
    
    updated_research = await service.update(
        research_id,
        {'analysis_results': analysis_result}
    )
    
    return updated_research
