const mongoose = require('mongoose');

const aiDesignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  generatedImage: {
    url: String,
    metadata: {
      model: String,
      parameters: mongoose.Schema.Types.Mixed,
      processingTime: Number
    }
  },
  style: {
    type: String,
    enum: ['traditional', 'modern', 'fusion', 'minimalist', 'ornate', 'rustic', 'contemporary']
  },
  category: {
    type: String,
    enum: ['Ceramics', 'Furniture', 'Textiles', 'Leather Goods', 'Glass Art', 'Kitchenware', 'Jewelry', 'Home Decor', 'Clothing', 'Art']
  },
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    },
    materials: [String],
    colors: [String],
    techniques: [String]
  },
  customization: {
    userInputs: mongoose.Schema.Types.Mixed,
    modifications: [{
      type: String,
      value: mongoose.Schema.Types.Mixed,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  matchedArtisans: [{
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan'
    },
    matchScore: Number,
    reasons: [String],
    estimatedPrice: {
      min: Number,
      max: Number
    },
    estimatedTime: String
  }],
  artisanResponses: [{
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan'
    },
    interested: {
      type: Boolean,
      required: true
    },
    message: String,
    estimatedPrice: {
      min: Number,
      max: Number
    },
    estimatedTime: String,
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'generated', 'matched', 'ordered', 'archived'],
    default: 'draft'
  },
  interactions: [{
    type: {
      type: String,
      enum: ['view', 'save', 'share', 'modify', 'order']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Text search index
aiDesignSchema.index({
  prompt: 'text',
  tags: 'text',
  category: 'text'
});

module.exports = mongoose.model('AIDesign', aiDesignSchema);