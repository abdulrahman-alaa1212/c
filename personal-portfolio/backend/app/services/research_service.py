from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
import asyncio
from app.models.research import Research
from app.schemas.research import ResearchCreate
from app.core.security import verify_file_safety
from app.utils.storage import upload_file, delete_file
from app.ml.research_analyzer import ResearchAnalyzer
from app.core.elasticsearch import es_client

class ResearchService:
    def __init__(self, db: Session):
        self.db = db
        self.analyzer = ResearchAnalyzer()

    async def get(self, research_id: int) -> Optional[Research]:
        """
        Get single research by ID.
        """
        return self.db.query(Research).filter(Research.id == research_id).first()

    async def get_multi(
        self,
        skip: int = 0,
        limit: int = 10,
        category: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[Research]:
        """
        Get multiple research papers with filtering and search.
        """
        query = self.db.query(Research)

        if category:
            query = query.filter(Research.categories.any(name=category))

        if search_query:
            # Use Elasticsearch for full-text search
            search_results = await es_client.search(
                index="researches",
                body={
                    "query": {
                        "multi_match": {
                            "query": search_query,
                            "fields": ["title^3", "abstract^2", "content"]
                        }
                    }
                }
            )
            research_ids = [hit["_id"] for hit in search_results["hits"]["hits"]]
            query = query.filter(Research.id.in_(research_ids))

        return query.offset(skip).limit(limit).all()

    async def create(self, research_data: ResearchCreate) -> Research:
        """
        Create new research with analysis.
        """
        # Create research object
        research = Research(**research_data.dict())
        
        # Analyze content
        analysis_tasks = [
            self.analyzer.analyze_research({
                'title': research.title,
                'abstract': research.abstract,
                'content': research.content,
                'keywords': research.keywords
            }),
            self.analyzer.generate_embedding(
                f"{research.title} {research.abstract}"
            ),
            self.analyzer.extract_topics(research.content)
        ]
        
        # Run analysis tasks concurrently
        analysis_results = await asyncio.gather(*analysis_tasks)
        
        # Update research with analysis results
        research.analysis_results = analysis_results[0]
        research.embedding_vector = analysis_results[1].tolist()
        research.topic_distribution = analysis_results[2]
        
        # Save to database
        self.db.add(research)
        self.db.commit()
        self.db.refresh(research)
        
        # Index in Elasticsearch
        await self._index_research(research)
        
        return research

    async def update(
        self,
        research_id: int,
        update_data: Dict[str, Any]
    ) -> Optional[Research]:
        """
        Update research and related analysis if needed.
        """
        research = await self.get(research_id)
        if not research:
            return None

        # Update fields
        for field, value in update_data.items():
            setattr(research, field, value)

        # Re-analyze if content changed
        content_fields = {'title', 'abstract', 'content'}
        if any(field in update_data for field in content_fields):
            analysis_tasks = [
                self.analyzer.analyze_research({
                    'title': research.title,
                    'abstract': research.abstract,
                    'content': research.content,
                    'keywords': research.keywords
                }),
                self.analyzer.generate_embedding(
                    f"{research.title} {research.abstract}"
                ),
                self.analyzer.extract_topics(research.content)
            ]
            
            analysis_results = await asyncio.gather(*analysis_tasks)
            
            research.analysis_results = analysis_results[0]
            research.embedding_vector = analysis_results[1].tolist()
            research.topic_distribution = analysis_results[2]

        # Save changes
        self.db.commit()
        self.db.refresh(research)
        
        # Update Elasticsearch index
        await self._index_research(research)
        
        return research

    async def remove(self, research_id: int) -> bool:
        """
        Delete research and related resources.
        """
        research = await self.get(research_id)
        if not research:
            return False

        # Delete related files
        if research.pdf_url:
            await delete_file(research.pdf_url)

        # Remove from Elasticsearch
        await es_client.delete(
            index="researches",
            id=str(research_id),
            ignore=[404]
        )

        # Delete from database
        self.db.delete(research)
        self.db.commit()
        
        return True

    async def upload_pdf(
        self,
        research_id: int,
        file: UploadFile
    ) -> str:
        """
        Upload and process PDF file for research.
        """
        research = await self.get(research_id)
        if not research:
            raise HTTPException(status_code=404, detail="Research not found")

        # Verify file safety
        await verify_file_safety(file)

        # Upload file
        pdf_url = await upload_file(
            file,
            folder="research_papers",
            allowed_types={"application/pdf"}
        )

        # Update research with PDF URL
        research.pdf_url = pdf_url
        self.db.commit()

        return pdf_url

    async def find_similar(
        self,
        research_id: int,
        limit: int = 5
    ) -> List[Research]:
        """
        Find similar research papers using ML.
        """
        research = await self.get(research_id)
        if not research or not research.embedding_vector:
            return []

        # Search in Elasticsearch using vector similarity
        search_results = await es_client.search(
            index="researches",
            body={
                "query": {
                    "script_score": {
                        "query": {"match_all": {}},
                        "script": {
                            "source": "cosineSimilarity(params.query_vector, 'embedding_vector') + 1.0",
                            "params": {"query_vector": research.embedding_vector}
                        }
                    }
                },
                "size": limit + 1  # +1 to exclude the query document
            }
        )

        # Filter out the query document and get research objects
        similar_ids = [
            int(hit["_id"]) 
            for hit in search_results["hits"]["hits"]
            if int(hit["_id"]) != research_id
        ][:limit]

        return self.db.query(Research).filter(Research.id.in_(similar_ids)).all()

    async def get_citations(self, research_id: int) -> Dict[str, Any]:
        """
        Get citation metrics for research.
        """
        research = await self.get(research_id)
        if not research:
            raise HTTPException(status_code=404, detail="Research not found")

        return {
            "total_citations": research.citations,
            "h_index": research.h_index,
            "impact_factor": research.impact_factor,
            "citations_per_year": await self._calculate_citations_per_year(research)
        }

    async def _index_research(self, research: Research) -> None:
        """
        Index research in Elasticsearch.
        """
        await es_client.index(
            index="researches",
            id=str(research.id),
            body={
                "title": research.title,
                "abstract": research.abstract,
                "content": research.content,
                "keywords": research.keywords,
                "embedding_vector": research.embedding_vector,
                "topic_distribution": research.topic_distribution,
                "created_at": research.created_at.isoformat(),
                "updated_at": research.updated_at.isoformat()
            }
        )

    async def _calculate_citations_per_year(
        self,
        research: Research
    ) -> Dict[int, int]:
        """
        Calculate citations per year.
        """
        # Implementation for calculating citations per year
        # This would typically involve external API calls to academic databases
        return {}
