const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessInfo: {
    businessName: String,
    description: String,
    yearsOfExperience: Number,
    certifications: [String]
  },
  skills: {
    primaryCraft: {
      type: String,
      required: true
    },
    specialties: [String],
    techniques: [String],
    materials: [String]
  },
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(val) {
            return !val || (Array.isArray(val) && val.length === 2);
          },
          message: 'Coordinates must be an array of [longitude, latitude]'
        }
      }
    },
    serviceRadius: {
      type: Number,
      default: 25 // kilometers
    }
  },
  portfolio: [{
    title: String,
    description: String,
    images: [String],
    category: String,
    price: Number,
    completionTime: String,
    tags: [String]
  }],
  pricing: {
    hourlyRate: Number,
    minimumOrder: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    workingHours: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    },
    unavailableDates: [Date]
  },
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
  socialMedia: {
    instagram: String,
    facebook: String,
    website: String
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    documents: [String],
    verifiedAt: Date
  }
}, {
  timestamps: true
});

// Index for location-based queries
artisanSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Artisan', artisanSchema);