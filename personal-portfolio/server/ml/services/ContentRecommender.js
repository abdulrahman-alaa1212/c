const tf = require('@tensorflow/tfjs-node');
const USE = require('@tensorflow-models/universal-sentence-encoder');
const { KMeans } = require('ml-kmeans');

class ContentRecommender {
  constructor() {
    this.model = null;
    this.encoder = null;
    this.contentEmbeddings = new Map();
  }

  async initialize() {
    // تحميل نموذج Universal Sentence Encoder
    this.encoder = await USE.load();
    console.log('Content Recommender initialized');
  }

  async generateEmbeddings(content) {
    const embeddings = await this.encoder.embed(content);
    return embeddings;
  }

  async updateContentEmbeddings(contents) {
    for (const content of contents) {
      const embedding = await this.generateEmbeddings(content.text);
      this.contentEmbeddings.set(content.id, embedding);
    }
  }

  async getRecommendations(userInterests, topK = 5) {
    const userEmbedding = await this.generateEmbeddings(userInterests);
    
    // حساب التشابه مع كل المحتوى
    const similarities = [];
    for (const [contentId, contentEmbedding] of this.contentEmbeddings) {
      const similarity = this.cosineSimilarity(
        userEmbedding.arraySync()[0],
        contentEmbedding.arraySync()[0]
      );
      similarities.push({ contentId, similarity });
    }

    // ترتيب النتائج وإرجاع أفضل K توصيات
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.contentId);
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
  }
}

module.exports = new ContentRecommender();
