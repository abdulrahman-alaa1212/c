const tf = require('@tensorflow/tfjs-node');
const { KMeans } = require('ml-kmeans');

class UserAnalytics {
  constructor() {
    this.userProfiles = new Map();
    this.interactionMatrix = [];
    this.clusterModel = null;
  }

  // تسجيل تفاعل المستخدم
  async logUserInteraction(userId, contentId, interactionType) {
    const interaction = {
      timestamp: Date.now(),
      contentId,
      type: interactionType,
      duration: 0
    };

    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        interactions: [],
        preferences: {},
        cluster: null
      });
    }

    const userProfile = this.userProfiles.get(userId);
    userProfile.interactions.push(interaction);

    // تحديث تفضيلات المستخدم
    this.updateUserPreferences(userId);
  }

  // تحديث تفضيلات المستخدم بناءً على تفاعلاته
  updateUserPreferences(userId) {
    const userProfile = this.userProfiles.get(userId);
    const preferences = {};

    userProfile.interactions.forEach(interaction => {
      if (!preferences[interaction.type]) {
        preferences[interaction.type] = 0;
      }
      preferences[interaction.type]++;
    });

    userProfile.preferences = preferences;
  }

  // تحليل نمط سلوك المستخدم
  async analyzeUserBehavior(userId) {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) return null;

    // تحويل التفاعلات إلى مصفوفة خصائص
    const features = this.extractFeatures(userProfile.interactions);
    
    // تصنيف نمط السلوك
    const behaviorPattern = await this.classifyBehavior(features);
    
    return {
      userId,
      pattern: behaviorPattern,
      preferences: userProfile.preferences,
      engagementScore: this.calculateEngagementScore(userProfile)
    };
  }

  // استخراج خصائص من تفاعلات المستخدم
  extractFeatures(interactions) {
    const features = {
      totalInteractions: interactions.length,
      averageDuration: 0,
      uniqueContent: new Set(),
      interactionTypes: {}
    };

    interactions.forEach(interaction => {
      features.averageDuration += interaction.duration;
      features.uniqueContent.add(interaction.contentId);
      
      if (!features.interactionTypes[interaction.type]) {
        features.interactionTypes[interaction.type] = 0;
      }
      features.interactionTypes[interaction.type]++;
    });

    features.averageDuration /= interactions.length || 1;
    return features;
  }

  // تصنيف سلوك المستخدم
  async classifyBehavior(features) {
    // تحويل الخصائص إلى تنسور
    const featureVector = tf.tensor([
      features.totalInteractions,
      features.averageDuration,
      features.uniqueContent.size
    ]);

    // استخدام K-means للتصنيف
    if (!this.clusterModel) {
      await this.trainClusterModel();
    }

    const cluster = this.clusterModel.predict(featureVector.arraySync());
    return this.getBehaviorLabel(cluster);
  }

  // تدريب نموذج التصنيف
  async trainClusterModel() {
    const data = Array.from(this.userProfiles.values()).map(profile => 
      this.extractFeatures(profile.interactions)
    );

    const kmeans = new KMeans(3); // 3 مجموعات: نشط جداً، معتدل، منخفض النشاط
    this.clusterModel = kmeans.fit(data);
  }

  // حساب درجة تفاعل المستخدم
  calculateEngagementScore(userProfile) {
    const weights = {
      view: 1,
      click: 2,
      share: 3,
      comment: 4
    };

    let score = 0;
    userProfile.interactions.forEach(interaction => {
      score += weights[interaction.type] || 1;
    });

    return score / userProfile.interactions.length;
  }

  // الحصول على تسمية نمط السلوك
  getBehaviorLabel(cluster) {
    const labels = [
      'High Engagement',
      'Moderate Engagement',
      'Low Engagement'
    ];
    return labels[cluster] || 'Unknown';
  }

  // الحصول على توصيات مخصصة بناءً على نمط السلوك
  async getPersonalizedRecommendations(userId) {
    const analysis = await this.analyzeUserBehavior(userId);
    
    // تخصيص التوصيات بناءً على نمط السلوك
    switch(analysis.pattern) {
      case 'High Engagement':
        return this.getAdvancedContentRecommendations(userId);
      case 'Moderate Engagement':
        return this.getMixedContentRecommendations(userId);
      case 'Low Engagement':
        return this.getBasicContentRecommendations(userId);
      default:
        return this.getDefaultRecommendations();
    }
  }
}

module.exports = new UserAnalytics();
