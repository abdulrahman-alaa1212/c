const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    enum: ['about', 'projects', 'research', 'ai-services', 'general-services']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  files: [{
    type: String // URLs للملفات المرفقة
  }],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
