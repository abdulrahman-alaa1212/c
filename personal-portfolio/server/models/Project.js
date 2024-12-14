const mongoose = require('mongoose');

const technologySchema = new mongoose.Schema({
  name: String,
  category: {
    type: String,
    enum: ['frontend', 'backend', 'database', 'ai', 'cloud', 'other']
  },
  proficiencyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  yearsOfExperience: Number
});

const metricSchema = new mongoose.Schema({
  name: String,
  value: Number,
  unit: String,
  timestamp: Date,
  category: {
    type: String,
    enum: ['performance', 'impact', 'engagement', 'technical']
  }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: {
    short: String,
    detailed: String,
    technical: String
  },
  category: {
    type: String,
    enum: ['research', 'commercial', 'opensource', 'experimental'],
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'maintenance'],
    default: 'planning'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'featured'],
    default: 'public'
  },
  technologies: [technologySchema],
  metrics: [metricSchema],
  links: {
    github: String,
    demo: String,
    documentation: String,
    publication: String
  },
  timeline: {
    started: Date,
    completed: Date,
    milestones: [{
      title: String,
      description: String,
      date: Date,
      status: {
        type: String,
        enum: ['pending', 'completed', 'delayed']
      }
    }]
  },
  team: [{
    role: String,
    responsibilities: [String],
    skills: [String]
  }],
  resources: [{
    type: {
      type: String,
      enum: ['code', 'document', 'image', 'video', 'dataset']
    },
    url: String,
    description: String
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    technicalComplexity: {
      type: Number,
      min: 1,
      max: 10
    },
    businessImpact: {
      type: Number,
      min: 1,
      max: 10
    },
    innovationScore: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  relatedResearch: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Research'
  }],
  aiServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIService'
  }],
  metadata: {
    keywords: [String],
    tags: [String],
    industry: [String],
    targetAudience: [String]
  }
}, {
  timestamps: true
});

// Indices للبحث السريع
projectSchema.index({ 'metadata.keywords': 1 });
projectSchema.index({ 'metadata.tags': 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ 'analytics.technicalComplexity': -1 });

// Middleware قبل الحفظ
projectSchema.pre('save', async function(next) {
  if (this.isModified('analytics')) {
    // تحديث Innovation Score تلقائياً
    this.analytics.innovationScore = await this.calculateInnovationScore();
  }
  next();
});

// Methods
projectSchema.methods = {
  async calculateInnovationScore() {
    const weights = {
      complexity: 0.3,
      impact: 0.3,
      novelty: 0.4
    };

    const noveltyScore = await this.assessNovelty();
    
    return (
      this.analytics.technicalComplexity * weights.complexity +
      this.analytics.businessImpact * weights.impact +
      noveltyScore * weights.novelty
    );
  },

  async assessNovelty() {
    // تقييم مدى ابتكارية المشروع
    let score = 0;
    
    // تحليل التقنيات المستخدمة
    const emergingTechScore = this.technologies.reduce((acc, tech) => {
      if (tech.category === 'ai' || tech.category === 'cloud') {
        acc += 2;
      }
      return acc;
    }, 0);

    // تحليل المقاييس
    const impactScore = this.metrics.reduce((acc, metric) => {
      if (metric.category === 'impact' && metric.value > 8) {
        acc += 1;
      }
      return acc;
    }, 0);

    score = (emergingTechScore + impactScore) / 3;
    return Math.min(score, 10); // تطبيع النتيجة
  },

  async generateReport() {
    return {
      overview: {
        title: this.title,
        status: this.status,
        duration: {
          start: this.timeline.started,
          end: this.timeline.completed,
          totalDays: this.calculateDuration()
        }
      },
      technical: {
        complexity: this.analytics.technicalComplexity,
        technologies: this.technologies,
        innovationScore: this.analytics.innovationScore
      },
      impact: {
        business: this.analytics.businessImpact,
        engagement: {
          views: this.analytics.views,
          likes: this.analytics.likes,
          shares: this.analytics.shares
        }
      },
      progress: this.calculateProgress(),
      recommendations: await this.generateRecommendations()
    };
  },

  calculateProgress() {
    const totalMilestones = this.timeline.milestones.length;
    const completedMilestones = this.timeline.milestones.filter(
      m => m.status === 'completed'
    ).length;

    return {
      percentage: (completedMilestones / totalMilestones) * 100,
      completed: completedMilestones,
      total: totalMilestones,
      remainingMilestones: this.timeline.milestones.filter(
        m => m.status === 'pending'
      )
    };
  },

  calculateDuration() {
    if (!this.timeline.completed) return null;
    return Math.ceil(
      (this.timeline.completed - this.timeline.started) / (1000 * 60 * 60 * 24)
    );
  },

  async generateRecommendations() {
    const recommendations = [];

    // تحليل التقنيات
    if (this.technologies.length < 3) {
      recommendations.push({
        type: 'technology',
        message: 'Consider diversifying the technology stack'
      });
    }

    // تحليل المقاييس
    if (this.metrics.length < 5) {
      recommendations.push({
        type: 'metrics',
        message: 'Add more performance metrics for better tracking'
      });
    }

    // تحليل الموارد
    if (this.resources.length < 2) {
      recommendations.push({
        type: 'resources',
        message: 'Add more project resources for better documentation'
      });
    }

    return recommendations;
  }
};

// Statics
projectSchema.statics = {
  async findSimilarProjects(projectId) {
    const project = await this.findById(projectId);
    if (!project) return [];

    return this.find({
      _id: { $ne: projectId },
      $or: [
        { 'metadata.keywords': { $in: project.metadata.keywords } },
        { 'metadata.industry': { $in: project.metadata.industry } },
        { category: project.category }
      ]
    }).limit(5);
  },

  async getTrendingProjects() {
    return this.find({
      visibility: 'public',
      'analytics.views': { $gt: 100 }
    })
    .sort({ 'analytics.views': -1, 'analytics.likes': -1 })
    .limit(10);
  }
};

module.exports = mongoose.model('Project', projectSchema);
