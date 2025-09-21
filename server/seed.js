const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const User = require('./models/User');
const Artisan = require('./models/Artisan');
const Product = require('./models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      {
        name: 'Elena Rodriguez',
        email: 'elena@example.com',
        password: hashedPassword,
        userType: 'artisan',
        profile: {
          avatar: '/placeholder.svg',
          phone: '+1234567890'
        }
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@example.com',
        password: hashedPassword,
        userType: 'artisan',
        profile: {
          avatar: '/placeholder.svg',
          phone: '+1234567891'
        }
      },
      {
        name: 'Sophia Williams',
        email: 'sophia@example.com',
        password: hashedPassword,
        userType: 'artisan',
        profile: {
          avatar: '/placeholder.svg',
          phone: '+1234567892'
        }
      },
      {
        name: 'David Thompson',
        email: 'david@example.com',
        password: hashedPassword,
        userType: 'artisan',
        profile: {
          avatar: '/placeholder.svg',
          phone: '+1234567893'
        }
      },
      {
        name: 'John Customer',
        email: 'customer@example.com',
        password: hashedPassword,
        userType: 'customer',
        profile: {
          avatar: '/placeholder.svg',
          preferences: {
            categories: ['Ceramics', 'Furniture'],
            priceRange: { min: 50, max: 500 }
          }
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Created users...');

    // Create artisan profiles
    const artisans = [
      {
        user: createdUsers[0]._id,
        businessInfo: {
          businessName: 'Elena\'s Ceramics Studio',
          description: 'Traditional pottery with modern flair',
          yearsOfExperience: 8,
          certifications: ['Master Potter Certificate']
        },
        skills: {
          primaryCraft: 'Ceramics',
          specialties: ['Pottery', 'Sculptures', 'Tableware'],
          techniques: ['Wheel throwing', 'Hand building', 'Glazing'],
          materials: ['Clay', 'Ceramic', 'Porcelain']
        },
        location: {
          city: 'San Francisco',
          state: 'California',
          coordinates: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749] // [longitude, latitude]
          }
        },
        pricing: {
          hourlyRate: 75,
          minimumOrder: 50
        },
        ratings: {
          average: 4.9,
          totalReviews: 24
        }
      },
      {
        user: createdUsers[1]._id,
        businessInfo: {
          businessName: 'Chen Woodworks',
          description: 'Sustainable furniture and wooden crafts',
          yearsOfExperience: 12,
          certifications: ['Sustainable Wood Certification']
        },
        skills: {
          primaryCraft: 'Woodworking',
          specialties: ['Furniture', 'Carving', 'Restoration'],
          techniques: ['Joinery', 'Carving', 'Finishing'],
          materials: ['Oak', 'Maple', 'Cherry', 'Bamboo']
        },
        location: {
          city: 'Portland',
          state: 'Oregon',
          coordinates: {
            type: 'Point',
            coordinates: [-122.6784, 45.5152] // [longitude, latitude]
          }
        },
        pricing: {
          hourlyRate: 85,
          minimumOrder: 100
        },
        ratings: {
          average: 4.8,
          totalReviews: 18
        }
      },
      {
        user: createdUsers[2]._id,
        businessInfo: {
          businessName: 'Sophia\'s Textile Art',
          description: 'Modern textiles with traditional techniques',
          yearsOfExperience: 6,
          certifications: ['Textile Arts Certificate']
        },
        skills: {
          primaryCraft: 'Textiles',
          specialties: ['Weaving', 'Embroidery', 'Quilting'],
          techniques: ['Hand weaving', 'Machine embroidery', 'Natural dyeing'],
          materials: ['Cotton', 'Wool', 'Silk', 'Linen']
        },
        location: {
          city: 'Austin',
          state: 'Texas',
          coordinates: {
            type: 'Point',
            coordinates: [-97.7431, 30.2672] // [longitude, latitude]
          }
        },
        pricing: {
          hourlyRate: 65,
          minimumOrder: 75
        },
        ratings: {
          average: 5.0,
          totalReviews: 32
        }
      },
      {
        user: createdUsers[3]._id,
        businessInfo: {
          businessName: 'Thompson Leather Craft',
          description: 'Premium leather goods handcrafted to perfection',
          yearsOfExperience: 15,
          certifications: ['Master Leather Craftsman']
        },
        skills: {
          primaryCraft: 'Leather Goods',
          specialties: ['Bags', 'Belts', 'Wallets'],
          techniques: ['Hand stitching', 'Tooling', 'Dyeing'],
          materials: ['Full grain leather', 'Vegetable tanned leather', 'Suede']
        },
        location: {
          city: 'Nashville',
          state: 'Tennessee',
          coordinates: {
            type: 'Point',
            coordinates: [-86.7816, 36.1627] // [longitude, latitude]
          }
        },
        pricing: {
          hourlyRate: 90,
          minimumOrder: 125
        },
        ratings: {
          average: 4.7,
          totalReviews: 45
        }
      }
    ];

    const createdArtisans = await Artisan.insertMany(artisans);
    console.log('Created artisan profiles...');

    // Create sample products
    const products = [
      {
        name: 'Handcrafted Ceramic Vase',
        description: 'Beautiful ceramic vase with traditional blue patterns, perfect for flowers or as decorative piece.',
        artisan: createdArtisans[0]._id,
        category: 'Ceramics',
        images: [
          { url: '/placeholder.svg', alt: 'Ceramic vase front view', isPrimary: true },
          { url: '/placeholder.svg', alt: 'Ceramic vase side view', isPrimary: false }
        ],
        pricing: {
          basePrice: 89,
          priceType: 'fixed'
        },
        specifications: {
          dimensions: { length: 15, width: 15, height: 25, unit: 'cm' },
          weight: { value: 0.8, unit: 'kg' },
          materials: ['Ceramic', 'Glaze'],
          colors: ['Blue', 'White'],
          finishes: ['Glossy']
        },
        customization: {
          isCustomizable: true,
          customOptions: [
            { name: 'Color', type: 'color', options: ['Blue', 'Green', 'Red', 'Black'], additionalCost: 0 },
            { name: 'Size', type: 'size', options: ['Small', 'Medium', 'Large'], additionalCost: 15 }
          ]
        },
        production: {
          estimatedTime: '1-2 weeks',
          difficulty: 'intermediate',
          techniques: ['Wheel throwing', 'Glazing'],
          tools: ['Potter\'s wheel', 'Kiln', 'Brushes']
        },
        tags: ['Handmade', 'Premium', 'Unique', 'Traditional'],
        ratings: { average: 4.8, totalReviews: 24 },
        seoData: {
          slug: 'handcrafted-ceramic-vase-1'
        },
        isFeatured: true
      },
      {
        name: 'Wooden Coffee Table',
        description: 'Sustainable oak coffee table with modern design and traditional joinery techniques.',
        artisan: createdArtisans[1]._id,
        category: 'Furniture',
        images: [
          { url: '/placeholder.svg', alt: 'Coffee table main view', isPrimary: true }
        ],
        pricing: {
          basePrice: 245,
          priceType: 'fixed'
        },
        specifications: {
          dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
          weight: { value: 25, unit: 'kg' },
          materials: ['Oak wood', 'Natural finish'],
          colors: ['Natural wood'],
          finishes: ['Matte']
        },
        customization: {
          isCustomizable: true,
          customOptions: [
            { name: 'Wood type', type: 'material', options: ['Oak', 'Maple', 'Cherry'], additionalCost: 50 },
            { name: 'Size', type: 'size', options: ['Standard', 'Large'], additionalCost: 100 }
          ]
        },
        production: {
          estimatedTime: '3-4 weeks',
          difficulty: 'advanced',
          techniques: ['Joinery', 'Sanding', 'Finishing'],
          tools: ['Table saw', 'Router', 'Sanders']
        },
        tags: ['Sustainable', 'Custom', 'Oak Wood', 'Modern'],
        ratings: { average: 4.9, totalReviews: 18 },
        seoData: {
          slug: 'wooden-coffee-table-1'
        },
        isFeatured: true
      },
      {
        name: 'Embroidered Wall Art',
        description: 'Contemporary embroidered wall art with vibrant colors and modern patterns.',
        artisan: createdArtisans[2]._id,
        category: 'Textiles',
        images: [
          { url: '/placeholder.svg', alt: 'Wall art front view', isPrimary: true }
        ],
        pricing: {
          basePrice: 135,
          priceType: 'fixed'
        },
        specifications: {
          dimensions: { length: 40, width: 30, height: 2, unit: 'cm' },
          weight: { value: 0.5, unit: 'kg' },
          materials: ['Cotton canvas', 'Embroidery thread'],
          colors: ['Multi-color'],
          finishes: ['Framed']
        },
        customization: {
          isCustomizable: true,
          customOptions: [
            { name: 'Pattern', type: 'design', options: ['Geometric', 'Floral', 'Abstract'], additionalCost: 25 },
            { name: 'Frame', type: 'material', options: ['Wood', 'Metal', 'No frame'], additionalCost: 30 }
          ]
        },
        production: {
          estimatedTime: '2-3 weeks',
          difficulty: 'intermediate',
          techniques: ['Hand embroidery', 'Pattern design'],
          tools: ['Embroidery hoops', 'Needles', 'Threads']
        },
        tags: ['Modern', 'Colorful', 'Handwoven', 'Art'],
        ratings: { average: 5.0, totalReviews: 32 },
        seoData: {
          slug: 'embroidered-wall-art-1'
        },
        isFeatured: true
      },
      {
        name: 'Leather Messenger Bag',
        description: 'Premium full-grain leather messenger bag, perfect for work or travel.',
        artisan: createdArtisans[3]._id,
        category: 'Leather Goods',
        images: [
          { url: '/placeholder.svg', alt: 'Messenger bag main view', isPrimary: true }
        ],
        pricing: {
          basePrice: 198,
          priceType: 'fixed'
        },
        specifications: {
          dimensions: { length: 38, width: 12, height: 28, unit: 'cm' },
          weight: { value: 1.2, unit: 'kg' },
          materials: ['Full grain leather', 'Brass hardware'],
          colors: ['Brown', 'Black'],
          finishes: ['Natural']
        },
        customization: {
          isCustomizable: true,
          customOptions: [
            { name: 'Color', type: 'color', options: ['Brown', 'Black', 'Tan'], additionalCost: 0 },
            { name: 'Personalization', type: 'text', options: ['Initials', 'Name'], additionalCost: 25 }
          ]
        },
        production: {
          estimatedTime: '2-3 weeks',
          difficulty: 'advanced',
          techniques: ['Hand stitching', 'Edge finishing', 'Hardware installation'],
          tools: ['Leather needles', 'Awl', 'Edge tools']
        },
        tags: ['Durable', 'Classic', 'Full Grain', 'Professional'],
        ratings: { average: 4.7, totalReviews: 45 },
        seoData: {
          slug: 'leather-messenger-bag-1'
        },
        isFeatured: false
      }
    ];

    // Create products individually to trigger pre-save middleware
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }
    console.log('Created sample products...');

    console.log('✅ Database seeded successfully!');
    console.log('Sample user credentials:');
    console.log('Customer: customer@example.com / password123');
    console.log('Artisan: elena@example.com / password123');
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();