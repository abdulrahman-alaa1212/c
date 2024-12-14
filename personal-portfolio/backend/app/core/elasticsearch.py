from elasticsearch import AsyncElasticsearch
from app.core.config import settings
import logging
from typing import Dict, Any, List
import asyncio

logger = logging.getLogger(__name__)

class ElasticsearchClient:
    def __init__(self):
        self.client = AsyncElasticsearch(
            hosts=settings.ELASTICSEARCH_HOSTS,
            basic_auth=(
                settings.ELASTICSEARCH_USERNAME,
                settings.ELASTICSEARCH_PASSWORD
            ),
            verify_certs=settings.ELASTICSEARCH_VERIFY_CERTS
        )
        self.index_settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "analysis": {
                "analyzer": {
                    "research_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "stop",
                            "snowball"
                        ]
                    }
                }
            }
        }
        self.research_mapping = {
            "properties": {
                "title": {
                    "type": "text",
                    "analyzer": "research_analyzer",
                    "fields": {
                        "keyword": {
                            "type": "keyword"
                        }
                    }
                },
                "abstract": {
                    "type": "text",
                    "analyzer": "research_analyzer"
                },
                "content": {
                    "type": "text",
                    "analyzer": "research_analyzer"
                },
                "keywords": {
                    "type": "keyword"
                },
                "authors": {
                    "type": "nested",
                    "properties": {
                        "name": {"type": "text"},
                        "affiliation": {"type": "text"}
                    }
                },
                "embedding_vector": {
                    "type": "dense_vector",
                    "dims": 768,  # Matches BERT embedding dimension
                    "index": True,
                    "similarity": "cosine"
                },
                "topic_distribution": {
                    "type": "nested",
                    "properties": {
                        "topic_id": {"type": "keyword"},
                        "words": {"type": "keyword"},
                        "weight": {"type": "float"}
                    }
                },
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"}
            }
        }

    async def initialize(self):
        """
        Initialize Elasticsearch indices and mappings.
        """
        try:
            if not await self.client.indices.exists(index="researches"):
                await self.client.indices.create(
                    index="researches",
                    settings=self.index_settings,
                    mappings=self.research_mapping
                )
                logger.info("Created 'researches' index")
        except Exception as e:
            logger.error(f"Error initializing Elasticsearch: {e}")
            raise

    async def index(
        self,
        index: str,
        id: str,
        body: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Index a document.
        """
        try:
            response = await self.client.index(
                index=index,
                id=id,
                body=body,
                refresh=True
            )
            return response
        except Exception as e:
            logger.error(f"Error indexing document: {e}")
            raise

    async def search(
        self,
        index: str,
        body: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Search for documents.
        """
        try:
            response = await self.client.search(
                index=index,
                body=body
            )
            return response
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            raise

    async def delete(
        self,
        index: str,
        id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Delete a document.
        """
        try:
            response = await self.client.delete(
                index=index,
                id=id,
                **kwargs
            )
            return response
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            raise

    async def bulk(
        self,
        operations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Perform bulk operations.
        """
        try:
            response = await self.client.bulk(
                operations=operations,
                refresh=True
            )
            return response
        except Exception as e:
            logger.error(f"Error performing bulk operation: {e}")
            raise

    async def update_mapping(
        self,
        index: str,
        mapping: Dict[str, Any]
    ) -> None:
        """
        Update index mapping.
        """
        try:
            await self.client.indices.put_mapping(
                index=index,
                body=mapping
            )
        except Exception as e:
            logger.error(f"Error updating mapping: {e}")
            raise

    async def get_mapping(self, index: str) -> Dict[str, Any]:
        """
        Get index mapping.
        """
        try:
            return await self.client.indices.get_mapping(index=index)
        except Exception as e:
            logger.error(f"Error getting mapping: {e}")
            raise

    async def close(self):
        """
        Close Elasticsearch client.
        """
        await self.client.close()

# Create singleton instance
es_client = ElasticsearchClient()

# Initialize indices on startup
async def init_elasticsearch():
    await es_client.initialize()

# Cleanup on shutdown
async def cleanup_elasticsearch():
    await es_client.close()
