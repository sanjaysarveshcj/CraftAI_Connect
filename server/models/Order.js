const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artisan'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    customization: {
      type: mongoose.Schema.Types.Mixed
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    estimatedDelivery: Date,
    progressUpdates: [{
      message: String,
      images: [String],
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  shipping: {
    address: {
      name: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String
    },
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard'
    },
    trackingNumber: String,
    estimatedDelivery: Date
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    amount: Number
  },
  status: {
    type: String,
    enum: ['draft', 'pending_payment', 'paid', 'confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
    default: 'draft'
  },
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderType: {
      type: String,
      enum: ['customer', 'artisan', 'admin']
    },
    message: String,
    attachments: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    customer: String,
    artisan: String,
    admin: String
  },
  // Additional fields for artisan dashboard
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  artisanNotes: String,
  totalAmount: {
    type: Number,
    default: function() {
      return this.pricing ? this.pricing.total : 0;
    }
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);