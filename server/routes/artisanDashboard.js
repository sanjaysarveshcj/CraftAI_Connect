const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AIDesign = require('../models/AIDesign');
const { authenticate } = require('../middleware/auth');
const { verifyArtisan } = require('../middleware/artisan');

// Apply authentication and artisan verification to all routes
router.use(authenticate);

// @route   GET /api/artisan/status
// @desc    Check if user has completed artisan registration
// @access  Private (any authenticated user)
router.get('/status', async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });
    
    res.json({
      success: true,
      data: {
        hasProfile: !!artisan,
        isComplete: !!(artisan && artisan.skills.primaryCraft && artisan.businessInfo.businessName),
        artisan: artisan ? {
          _id: artisan._id,
          businessName: artisan.businessInfo.businessName,
          primaryCraft: artisan.skills.primaryCraft,
          isActive: artisan.availability.isActive
        } : null
      }
    });
  } catch (error) {
    console.error('Artisan status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking artisan status'
    });
  }
});

// @route   POST /api/artisan/register
// @desc    Register new artisan profile
// @access  Private (any authenticated user)
router.post('/register', async (req, res) => {
  try {
    // Check if user already has an artisan profile
    const existingArtisan = await Artisan.findOne({ user: req.user._id });
    
    if (existingArtisan) {
      return res.status(400).json({
        success: false,
        message: 'Artisan profile already exists'
      });
    }

    const {
      businessInfo,
      skills,
      location,
      portfolio = [],
      pricing = {},
      availability = { isActive: true }
    } = req.body;

    // Validate required fields
    if (!skills?.primaryCraft || !businessInfo?.businessName) {
      return res.status(400).json({
        success: false,
        message: 'Primary craft and business name are required'
      });
    }

    // Create new artisan profile
    const artisanData = {
      user: req.user._id,
      businessInfo: {
        businessName: businessInfo.businessName,
        description: businessInfo.description || '',
        yearsOfExperience: businessInfo.yearsOfExperience || 0,
        certifications: businessInfo.certifications || []
      },
      skills: {
        primaryCraft: skills.primaryCraft,
        specialties: skills.specialties || [],
        techniques: skills.techniques || [],
        materials: skills.materials || []
      },
      location: {
        address: location?.address || '',
        city: location?.city || '',
        state: location?.state || '',
        serviceRadius: location?.serviceRadius || 25
        // Note: We'll add coordinates later when we have geolocation feature
      },
      portfolio,
      pricing: {
        hourlyRate: pricing.hourlyRate || 0,
        minimumOrder: pricing.minimumOrder || 0,
        currency: pricing.currency || 'USD'
      },
      availability: {
        isActive: availability.isActive !== false
      },
      ratings: {
        average: 0,
        totalReviews: 0
      }
    };

    const artisan = new Artisan(artisanData);
    await artisan.save();

    // Return the created artisan profile
    const newArtisan = await Artisan.findById(artisan._id)
      .populate('user', 'name email profile')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Artisan profile created successfully',
      data: {
        artisan: newArtisan
      }
    });
  } catch (error) {
    console.error('Artisan registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating artisan profile'
    });
  }
});

// Apply artisan verification to remaining routes
router.use(verifyArtisan);

// @route   GET /api/artisan/dashboard
// @desc    Get artisan dashboard overview
// @access  Private (Artisan only)
router.get('/dashboard', async (req, res) => {
  try {
    const artisan = req.artisan; // From verifyArtisan middleware

    // Get dashboard statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Orders statistics
    const totalOrders = await Order.countDocuments({ 
      'items.product': { $in: await Product.find({ artisan: artisan._id }).select('_id') }
    });

    const monthlyOrders = await Order.countDocuments({
      'items.product': { $in: await Product.find({ artisan: artisan._id }).select('_id') },
      createdAt: { $gte: startOfMonth }
    });

    // Revenue statistics
    const revenueAggregation = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.artisan': artisan._id,
          status: { $in: ['completed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', startOfMonth] },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const revenue = revenueAggregation[0] || { totalRevenue: 0, monthlyRevenue: 0 };

    // Product statistics
    const totalProducts = await Product.countDocuments({ artisan: artisan._id });
    const activeProducts = await Product.countDocuments({ 
      artisan: artisan._id, 
      isActive: true 
    });

    // Recent orders
    const recentOrders = await Order.find({
      'items.product': { $in: await Product.find({ artisan: artisan._id }).select('_id') }
    })
      .populate('customer', 'name email')
      .populate('items.product', 'name images pricing')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // AI design requests related to artisan's skills
    const designRequests = await AIDesign.find({
      'matchedArtisans.artisan': artisan._id,
      status: 'generated'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean();

    res.json({
      success: true,
      data: {
        artisan: {
          _id: artisan._id,
          businessName: artisan.businessInfo.businessName,
          avatar: artisan.user.profile?.avatar,
          name: artisan.user.name,
          email: artisan.user.email,
          rating: artisan.ratings.average,
          totalReviews: artisan.ratings.count
        },
        statistics: {
          orders: {
            total: totalOrders,
            monthly: monthlyOrders,
            growth: monthlyOrders // Could calculate percentage growth
          },
          revenue: {
            total: revenue.totalRevenue,
            monthly: revenue.monthlyRevenue,
            currency: 'USD'
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            inactive: totalProducts - activeProducts
          }
        },
        recentOrders,
        designRequests
      }
    });
  } catch (error) {
    console.error('Artisan dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/artisan/profile
// @desc    Get artisan profile for editing
// @access  Private (Artisan only)
router.get('/profile', async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.artisan._id)
      .populate('user', 'name email profile')
      .lean();

    res.json({
      success: true,
      data: {
        artisan
      }
    });
  } catch (error) {
    console.error('Get artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/artisan/profile
// @desc    Update artisan profile
// @access  Private (Artisan only)
router.put('/profile', async (req, res) => {
  try {
    const artisan = req.artisan; // From middleware

    const {
      businessInfo,
      skills,
      location,
      portfolio,
      pricing,
      availability,
      personalInfo
    } = req.body;

    // Update artisan fields
    if (businessInfo) {
      artisan.businessInfo = { ...artisan.businessInfo, ...businessInfo };
    }
    if (skills) {
      artisan.skills = { ...artisan.skills, ...skills };
    }
    if (location) {
      artisan.location = { ...artisan.location, ...location };
    }
    if (portfolio) {
      artisan.portfolio = { ...artisan.portfolio, ...portfolio };
    }
    if (pricing) {
      artisan.pricing = { ...artisan.pricing, ...pricing };
    }
    if (availability) {
      artisan.availability = { ...artisan.availability, ...availability };
    }

    // Update user personal info if provided
    if (personalInfo) {
      await User.findByIdAndUpdate(req.user._id, {
        name: personalInfo.name || req.user.name,
        'profile.phone': personalInfo.phone,
        'profile.bio': personalInfo.bio,
        'profile.avatar': personalInfo.avatar
      });
    }

    await artisan.save();

    // Return updated artisan
    const updatedArtisan = await Artisan.findById(artisan._id)
      .populate('user', 'name email profile')
      .lean();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        artisan: updatedArtisan
      }
    });
  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/artisan/products
// @desc    Get artisan's products with management info
// @access  Private (Artisan only)
router.get('/products', async (req, res) => {
  try {
    const artisan = req.artisan;

    const { page = 1, limit = 12, status = 'all' } = req.query;

    // Build filter
    const filter = { artisan: artisan._id };
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Add order statistics for each product
    for (let product of products) {
      const orderCount = await Order.countDocuments({
        'items.product': product._id,
        status: { $in: ['completed', 'shipped', 'delivered'] }
      });
      product.totalOrders = orderCount;
    }

    const total = await Product.countDocuments(filter);

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
      message: 'Server error while fetching products'
    });
  }
});

// @route   POST /api/artisan/products
// @desc    Create new product
// @access  Private (Artisan only)
router.post('/products', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const productData = {
      ...req.body,
      artisan: artisan._id
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
});

// @route   PUT /api/artisan/products/:id
// @desc    Update product
// @access  Private (Artisan only)
router.put('/products/:id', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, artisan: artisan._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/artisan/products/:id
// @desc    Delete/deactivate product
// @access  Private (Artisan only)
router.delete('/products/:id', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, artisan: artisan._id },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
});

// @route   GET /api/artisan/orders
// @desc    Get artisan's orders
// @access  Private (Artisan only)
router.get('/orders', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const { page = 1, limit = 10, status = 'all' } = req.query;

    // Get artisan's product IDs
    const productIds = await Product.find({ artisan: artisan._id }).select('_id');
    const productIdArray = productIds.map(p => p._id);

    // Build filter
    const filter = {
      'items.product': { $in: productIdArray }
    };

    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .populate('customer', 'name email profile')
      .populate('items.product', 'name images pricing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / limit),
          count: orders.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   PUT /api/artisan/orders/:id/status
// @desc    Update order status
// @access  Private (Artisan only)
router.put('/orders/:id/status', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const { status, trackingNumber, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Verify order belongs to artisan
    const productIds = await Product.find({ artisan: artisan._id }).select('_id');
    const productIdArray = productIds.map(p => p._id);

    const order = await Order.findOne({
      _id: req.params.id,
      'items.product': { $in: productIdArray }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    // Update order
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.artisanNotes = notes;
    
    // Update timestamps
    if (status === 'confirmed') order.confirmedAt = new Date();
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// @route   GET /api/artisan/design-requests
// @desc    Get AI design requests matching artisan's skills
// @access  Private (Artisan only)
router.get('/design-requests', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const { page = 1, limit = 10, status = 'all' } = req.query;

    // Build filter based on artisan's skills
    const filter = {
      $or: [
        { 'matchedArtisans.artisan': artisan._id },
        { category: { $in: artisan.skills.specialties } },
        { category: artisan.skills.primaryCraft }
      ]
    };

    if (status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const designRequests = await AIDesign.find(filter)
      .populate('user', 'name email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await AIDesign.countDocuments(filter);

    res.json({
      success: true,
      data: {
        designRequests,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / limit),
          count: designRequests.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get design requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching design requests'
    });
  }
});

// @route   POST /api/artisan/design-requests/:id/respond
// @desc    Respond to a design request
// @access  Private (Artisan only)
router.post('/design-requests/:id/respond', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const { interested, message, estimatedPrice, estimatedTime } = req.body;

    const design = await AIDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Design request not found'
      });
    }

    // Add or update artisan response
    const existingResponseIndex = design.artisanResponses.findIndex(
      response => response.artisan.toString() === artisan._id.toString()
    );

    const responseData = {
      artisan: artisan._id,
      interested,
      message,
      estimatedPrice: estimatedPrice ? {
        min: estimatedPrice.min,
        max: estimatedPrice.max
      } : undefined,
      estimatedTime,
      respondedAt: new Date()
    };

    if (existingResponseIndex >= 0) {
      design.artisanResponses[existingResponseIndex] = responseData;
    } else {
      design.artisanResponses.push(responseData);
    }

    await design.save();

    res.json({
      success: true,
      message: 'Response submitted successfully',
      data: {
        response: responseData
      }
    });
  } catch (error) {
    console.error('Respond to design request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to design request'
    });
  }
});

// @route   GET /api/artisan/analytics
// @desc    Get business analytics
// @access  Private (Artisan only)
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get product IDs
    const productIds = await Product.find({ artisan: artisan._id }).select('_id');
    const productIdArray = productIds.map(p => p._id);

    // Sales analytics
    const salesData = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIdArray },
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Product performance
    const productPerformance = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIdArray },
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.product': { $in: productIdArray }
        }
      },
      {
        $group: {
          _id: '$items.product',
          totalSales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalSales: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Customer analytics
    const customerStats = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIdArray },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          uniqueCustomers: { $addToSet: '$customer' },
          repeatCustomers: {
            $push: '$customer'
          }
        }
      },
      {
        $project: {
          uniqueCustomers: { $size: '$uniqueCustomers' },
          totalOrders: { $size: '$repeatCustomers' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        salesData,
        productPerformance,
        customerStats: customerStats[0] || { uniqueCustomers: 0, totalOrders: 0 }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;