import numpy as np
import torch
from transformers import AutoTokenizer, AutoModel
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import tensorflow as tf
import tensorflow_hub as hub
from typing import List, Dict, Any
import pandas as pd
from app.core.config import settings
import asyncio
from functools import lru_cache

class ResearchAnalyzer:
    def __init__(self):
        self.device = torch.device(settings.TORCH_DEVICE)
        self.initialize_models()

    def initialize_models(self):
        """Initialize all required ML models"""
        # BERT model for text understanding
        self.tokenizer = AutoTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
        self.bert_model = AutoModel.from_pretrained('allenai/scibert_scivocab_uncased').to(self.device)
        
        # Sentence transformer for embeddings
        self.sentence_transformer = SentenceTransformer('allenai/specter')
        
        # Topic modeling
        self.tfidf = TfidfVectorizer(max_features=5000, stop_words='english')
        self.lda = LatentDirichletAllocation(n_components=10, random_state=42)
        
        # Universal Sentence Encoder for semantic similarity
        self.use_model = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")

    @torch.no_grad()
    async def analyze_research(self, research_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive research analysis"""
        # Parallel processing of different analyses
        results = await asyncio.gather(
            self.analyze_content_quality(research_data),
            self.analyze_novelty(research_data),
            self.analyze_methodology(research_data),
            self.analyze_impact_potential(research_data)
        )

        content_quality, novelty, methodology, impact = results

        return {
            'content_quality': content_quality,
            'novelty': novelty,
            'methodology': methodology,
            'impact_potential': impact,
            'overall_score': self.calculate_overall_score(results)
        }

    async def analyze_content_quality(self, research_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze the quality of research content"""
        text = f"{research_data['title']} {research_data['abstract']}"
        
        # Tokenize and get BERT embeddings
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        outputs = self.bert_model(**inputs)
        
        # Extract features from BERT
        embeddings = outputs.last_hidden_state.mean(dim=1)
        
        # Calculate various quality metrics
        clarity_score = self.calculate_clarity_score(embeddings)
        coherence_score = self.calculate_coherence_score(text)
        technical_depth = self.assess_technical_depth(text)
        
        return {
            'clarity': float(clarity_score),
            'coherence': coherence_score,
            'technical_depth': technical_depth,
            'overall_quality': np.mean([clarity_score, coherence_score, technical_depth])
        }

    async def analyze_novelty(self, research_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze research novelty"""
        # Generate embeddings for novelty analysis
        text = f"{research_data['title']} {research_data['abstract']}"
        embeddings = self.sentence_transformer.encode(text)
        
        # Calculate various novelty metrics
        uniqueness_score = self.calculate_uniqueness(embeddings)
        innovation_score = self.assess_innovation(research_data)
        
        return {
            'uniqueness': float(uniqueness_score),
            'innovation': float(innovation_score),
            'overall_novelty': np.mean([uniqueness_score, innovation_score])
        }

    async def analyze_methodology(self, research_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze research methodology"""
        content = research_data.get('content', '')
        
        # Identify methodology patterns
        methodology_types = self.identify_methodology_types(content)
        robustness_score = self.assess_methodology_robustness(content)
        validation_score = self.assess_validation_methods(content)
        
        return {
            'methodology_types': methodology_types,
            'robustness': float(robustness_score),
            'validation': float(validation_score),
            'overall_methodology': np.mean([robustness_score, validation_score])
        }

    async def analyze_impact_potential(self, research_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze potential impact of the research"""
        # Generate embeddings for impact analysis
        text = f"{research_data['title']} {research_data['abstract']}"
        embeddings = self.use_model([text])[0]
        
        # Calculate various impact metrics
        academic_impact = self.predict_academic_impact(embeddings)
        practical_impact = self.predict_practical_impact(research_data)
        citation_potential = self.predict_citation_potential(research_data)
        
        return {
            'academic_impact': float(academic_impact),
            'practical_impact': float(practical_impact),
            'citation_potential': float(citation_potential),
            'overall_impact': np.mean([academic_impact, practical_impact, citation_potential])
        }

    @torch.no_grad()
    async def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding vector for text"""
        return self.sentence_transformer.encode(text)

    async def extract_topics(self, text: str) -> Dict[str, float]:
        """Extract main topics from text"""
        # Transform text to TF-IDF
        tfidf_matrix = self.tfidf.fit_transform([text])
        
        # Apply LDA for topic modeling
        lda_output = self.lda.fit_transform(tfidf_matrix)
        
        # Get feature names
        feature_names = self.tfidf.get_feature_names_out()
        
        # Extract top topics
        topics = {}
        for topic_idx, topic in enumerate(self.lda.components_):
            top_words = [feature_names[i] for i in topic.argsort()[:-10 - 1:-1]]
            topics[f"topic_{topic_idx}"] = {
                'words': top_words,
                'weight': float(lda_output[0][topic_idx])
            }
        
        return topics

    # Helper methods
    def calculate_clarity_score(self, embeddings: torch.Tensor) -> float:
        """Calculate clarity score based on embedding structure"""
        # Implementation for clarity calculation
        return float(torch.mean(torch.std(embeddings, dim=1)))

    def calculate_coherence_score(self, text: str) -> float:
        """Calculate coherence score of the text"""
        # Implementation for coherence calculation
        sentences = text.split('.')
        if len(sentences) < 2:
            return 0.8
        
        embeddings = self.use_model(sentences)
        similarities = tf.matmul(embeddings, embeddings, transpose_b=True)
        coherence = tf.reduce_mean(similarities)
        return float(coherence)

    def assess_technical_depth(self, text: str) -> float:
        """Assess technical depth of the content"""
        # Implementation for technical depth assessment
        technical_terms = self.count_technical_terms(text)
        return min(1.0, technical_terms / 100)

    def calculate_overall_score(self, results: List[Dict[str, Any]]) -> float:
        """Calculate overall research score"""
        weights = {
            'content_quality': 0.3,
            'novelty': 0.25,
            'methodology': 0.25,
            'impact_potential': 0.2
        }
        
        scores = []
        for result, (metric, weight) in zip(results, weights.items()):
            if isinstance(result, dict) and 'overall_' + metric.split('_')[0] in result:
                scores.append(result['overall_' + metric.split('_')[0]] * weight)
        
        return sum(scores)

    @lru_cache(maxsize=1000)
    def count_technical_terms(self, text: str) -> int:
        """Count technical terms in text"""
        # Implementation for technical terms counting
        # This could be enhanced with a comprehensive technical terms dictionary
        return len(set(text.lower().split()) & self.get_technical_terms())

    @staticmethod
    def get_technical_terms() -> set:
        """Get set of technical terms"""
        # This should be expanded with a comprehensive list
        return {
            'algorithm', 'methodology', 'framework', 'analysis',
            'model', 'system', 'data', 'research', 'study',
            'implementation', 'results', 'performance', 'evaluation'
        }
