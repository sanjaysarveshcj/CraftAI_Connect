const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      intent: String,
      entities: mongoose.Schema.Types.Mixed,
      confidence: Number
    }
  }],
  context: {
    userPreferences: {
      categories: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      style: String,
      materials: [String]
    },
    generatedDesigns: [{
      prompt: String,
      imageUrl: String,
      parameters: mongoose.Schema.Types.Mixed,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    recommendedProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      score: Number,
      reason: String
    }],
    recommendedArtisans: [{
      artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artisan'
      },
      score: Number,
      reason: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for session management
aiChatSchema.index({ user: 1, sessionId: 1 });
aiChatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('AIChat', aiChatSchema);