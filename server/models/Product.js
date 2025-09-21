const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Ceramics', 'Furniture', 'Textiles', 'Leather Goods', 'Glass Art', 'Kitchenware', 'Jewelry', 'Home Decor', 'Clothing', 'Art']
  },
  subcategory: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    priceType: {
      type: String,
      enum: ['fixed', 'custom', 'hourly'],
      default: 'fixed'
    }
  },
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches', 'meters'],
        default: 'cm'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['grams', 'kg', 'pounds'],
        default: 'kg'
      }
    },
    materials: [String],
    colors: [String],
    finishes: [String]
  },
  customization: {
    isCustomizable: {
      type: Boolean,
      default: false
    },
    customOptions: [{
      name: String,
      type: {
        type: String,
        enum: ['color', 'size', 'material', 'text', 'design']
      },
      options: [String],
      additionalCost: Number
    }]
  },
  production: {
    estimatedTime: String, // e.g., "2-3 weeks"
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    techniques: [String],
    tools: [String]
  },
  inventory: {
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    isUnique: {
      type: Boolean,
      default: true
    }
  },
  tags: [String],
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  seoData: {
    slug: String,
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  category: 'text'
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (!this.seoData.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Add timestamp to ensure uniqueness
    this.seoData.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);