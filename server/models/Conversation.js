const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'order_request', 'order_response', 'product_share', 'design_share'],
    default: 'text'
  },
  attachments: [{
    type: String, // File URLs
  }],
  metadata: {
    // For order-related messages
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    designId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIDesign'
    },
    // For order requests
    orderDetails: {
      quantity: Number,
      customization: mongoose.Schema.Types.Mixed,
      estimatedPrice: {
        min: Number,
        max: Number
      },
      timeline: String,
      specifications: mongoose.Schema.Types.Mixed
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'artisan'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  }],
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    default: 'Product Inquiry'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Related context
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  relatedDesign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIDesign'
  },
  // Order tracking
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Create compound index for participants lookup
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ artisan: 1, customer: 1 });
conversationSchema.index({ lastActivity: -1 });

// Add index for message queries
messageSchema.index({ conversation: 1, createdAt: -1 });

const messageModel = mongoose.model('Message', messageSchema);
const conversationModel = mongoose.model('Conversation', conversationSchema);

module.exports = { Message: messageModel, Conversation: conversationModel };