const express = require('express');
const router = express.Router();
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/artisans
// @desc    Get all artisans with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      skill,
      city,
      state,
      latitude,
      longitude,
      radius = 25, // km
      minRating,
      sortBy = 'ratings.average',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { 'availability.isActive': true };

    // Search functionality
    if (search) {
      filter.$or = [
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
        { 'businessInfo.description': { $regex: search, $options: 'i' } },
        { 'skills.primaryCraft': { $regex: search, $options: 'i' } },
        { 'skills.specialties': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Skill filter
    if (skill) {
      filter.$or = [
        { 'skills.primaryCraft': { $regex: skill, $options: 'i' } },
        { 'skills.specialties': { $in: [new RegExp(skill, 'i')] } }
      ];
    }

    // Location filters
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      filter['location.state'] = { $regex: state, $options: 'i' };
    }

    // Geographic proximity filter
    if (latitude && longitude) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    // Rating filter
    if (minRating) {
      filter['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const artisans = await Artisan.find(filter)
      .populate('user', 'name profile.avatar profile.phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Calculate distance if coordinates provided
    if (latitude && longitude) {
      artisans.forEach(artisan => {
        if (artisan.location.coordinates && artisan.location.coordinates.coordinates) {
          const [artisanLng, artisanLat] = artisan.location.coordinates.coordinates;
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            artisanLat,
            artisanLng
          );
          artisan.distance = Math.round(distance * 10) / 10; // Round to 1 decimal
        }
      });
    }

    // Get total count for pagination
    const total = await Artisan.countDocuments(filter);

    res.json({
      success: true,
      data: {
        artisans,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / limit),
          count: artisans.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching artisans'
    });
  }
});

// @route   GET /api/artisans/search
// @desc    Search artisans by location name
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { location, radius = 25, limit = 10 } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location parameter is required'
      });
    }

    // Search for artisans by city or state name
    const filter = {
      'availability.isActive': true,
      $or: [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.address': { $regex: location, $options: 'i' } }
      ]
    };

    const artisans = await Artisan.find(filter)
      .populate('user', 'name profile.avatar')
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: {
        artisans,
        searchLocation: location,
        radius: radius,
        count: artisans.length
      }
    });
  } catch (error) {
    console.error('Search artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching artisans'
    });
  }
});

// @route   GET /api/artisans/skills
// @desc    Get all artisan skills/crafts
// @access  Public
router.get('/skills', async (req, res) => {
  try {
    const skills = await Artisan.aggregate([
      { $match: { 'availability.isActive': true } },
      {
        $group: {
          _id: null,
          primaryCrafts: { $addToSet: '$skills.primaryCraft' },
          specialties: { $addToSet: '$skills.specialties' }
        }
      }
    ]);

    let allSkills = [];
    if (skills.length > 0) {
      allSkills = [
        ...skills[0].primaryCrafts,
        ...skills[0].specialties.flat()
      ];
    }

    // Remove duplicates and sort
    const uniqueSkills = [...new Set(allSkills)].sort();

    res.json({
      success: true,
      data: {
        skills: uniqueSkills
      }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching skills'
    });
  }
});

// @route   GET /api/artisans/nearby
// @desc    Get nearby artisans based on location
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 25, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const artisans = await Artisan.find({
      'availability.isActive': true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
      .populate('user', 'name profile.avatar')
      .limit(Number(limit))
      .lean();

    // Calculate distances
    artisans.forEach(artisan => {
      if (artisan.location.coordinates && artisan.location.coordinates.coordinates) {
        const [artisanLng, artisanLat] = artisan.location.coordinates.coordinates;
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          artisanLat,
          artisanLng
        );
        artisan.distance = Math.round(distance * 10) / 10;
      }
    });

    res.json({
      success: true,
      data: {
        artisans
      }
    });
  } catch (error) {
    console.error('Get nearby artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby artisans'
    });
  }
});

// @route   GET /api/artisans/:id
// @desc    Get single artisan by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ 
      _id: req.params.id,
      'availability.isActive': true 
    })
      .populate('user', 'name profile.avatar profile.phone')
      .lean();

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Get artisan's products
    const products = await Product.find({ 
      artisan: artisan._id,
      isActive: true 
    })
      .select('name images pricing.basePrice ratings category')
      .limit(6)
      .lean();

    res.json({
      success: true,
      data: {
        artisan,
        products
      }
    });
  } catch (error) {
    console.error('Get artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching artisan'
    });
  }
});

// @route   GET /api/artisans/:id/products
// @desc    Get all products by an artisan
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const artisan = await Artisan.findOne({ 
      _id: req.params.id,
      'availability.isActive': true 
    });

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    const skip = (page - 1) * limit;
    const products = await Product.find({ 
      artisan: artisan._id,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments({ 
      artisan: artisan._id,
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / limit),
          count: products.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get artisan products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching artisan products'
    });
  }
});

// @route   POST /api/artisans/:id/contact
// @desc    Send message to artisan
// @access  Private
router.post('/:id/contact', authenticate, async (req, res) => {
  try {
    const { message, subject } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const artisan = await Artisan.findOne({ 
      _id: req.params.id,
      'availability.isActive': true 
    }).populate('user', 'name email');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Here you would typically send an email or create a message record
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: 'Message sent successfully to ' + artisan.user.name,
      data: {
        contactInfo: {
          name: artisan.user.name,
          businessName: artisan.businessInfo.businessName
        }
      }
    });
  } catch (error) {
    console.error('Contact artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while contacting artisan'
    });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;