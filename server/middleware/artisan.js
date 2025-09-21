const Artisan = require('../models/Artisan');

// Middleware to verify artisan access
const verifyArtisan = async (req, res, next) => {
  try {
    // Check if user is authenticated (this should come after authenticate middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has an artisan profile
    const artisan = await Artisan.findOne({ user: req.user._id });

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account required.'
      });
    }

    // Check if artisan account is active
    if (!artisan.availability.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan account is inactive.'
      });
    }

    // Add artisan to request object for use in route handlers
    req.artisan = artisan;
    next();
  } catch (error) {
    console.error('Artisan verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during artisan verification'
    });
  }
};

module.exports = { verifyArtisan };