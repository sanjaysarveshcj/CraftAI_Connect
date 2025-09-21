const express = require('express');
const router = express.Router();
const AIChat = require('../models/AIChat');
const AIDesign = require('../models/AIDesign');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const { authenticate } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

// @route   POST /api/ai/chat
// @desc    Send message to AI assistant
// @access  Private
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Use Gemini AI to generate response
    const aiResponse = await geminiService.generateChatResponse(message, {
      sessionId: sessionId || `session_${Date.now()}`,
      userId: req.user._id
    });

    // Optionally save chat to database
    try {
      const chatSession = new AIChat({
        user: req.user._id,
        sessionId: aiResponse.sessionId,
        messages: [
          {
            type: 'user',
            content: message,
            timestamp: new Date()
          },
          {
            type: 'bot', 
            content: aiResponse.message,
            timestamp: new Date()
          }
        ],
        context: {
          recommendedProducts: aiResponse.recommendedProducts || [],
          recommendedArtisans: aiResponse.recommendedArtisans || []
        },
        isActive: true
      });

      await chatSession.save();
    } catch (dbError) {
      console.warn('Failed to save chat to database:', dbError.message);
      // Continue without failing the request
    }

    res.json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing chat',
      error: error.message
    });
  }
});

// @route   GET /api/ai/chat/:sessionId
// @desc    Get chat history
// @access  Private
router.get('/chat/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chatSession = await AIChat.findOne({
      user: req.user._id,
      sessionId,
      isActive: true
    }).populate('context.recommendedProducts.product', 'name images pricing')
      .populate('context.recommendedArtisans.artisan', 'user businessInfo skills location ratings')
      .lean();

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        messages: chatSession.messages,
        context: chatSession.context
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat history'
    });
  }
});

// @route   POST /api/ai/generate-design
// @desc    Generate AI design from text prompt
// @access  Private
router.post('/generate-design', authenticate, async (req, res) => {
  try {
    const { prompt, style, category } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Design prompt is required'
      });
    }

    // Use Gemini AI to generate design
    const designResult = await geminiService.generateDesign(prompt, style, category);

    // Optionally save design to database
    try {
      const aiDesign = new AIDesign({
        user: req.user._id,
        prompt: prompt,
        style: style || 'traditional',
        category: category || 'Art',
        result: designResult,
        status: 'generated',
        generatedAt: new Date()
      });

      await aiDesign.save();
      designResult._id = aiDesign._id; // Add database ID to result
    } catch (dbError) {
      console.warn('Failed to save design to database:', dbError.message);
      // Continue without failing the request
    }

    res.json({
      success: true,
      data: designResult,
      message: 'Design generated successfully!'
    });
  } catch (error) {
    console.error('Generate design error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating design',
      error: error.message
    });
  }
});

// @route   GET /api/ai/designs
// @desc    Get user's AI designs  
// @access  Private
router.get('/designs', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const designs = await AIDesign.find({ user: req.user._id })
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AIDesign.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        designs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching designs',
      error: error.message
    });
  }
});

// @route   GET /api/ai/designs
// @desc    Get user's AI generated designs
// @access  Private
router.get('/designs', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const skip = (page - 1) * limit;
    const designs = await AIDesign.find({ user: req.user._id })
      .populate('matchedArtisans.artisan', 'user businessInfo skills ratings')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await AIDesign.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        designs,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / limit),
          count: designs.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching designs'
    });
  }
});

// @route   GET /api/ai/recommendations
// @desc    Get AI recommendations for products and artisans
// @access  Private
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const { type = 'all' } = req.query;

    const recommendations = {};

    if (type === 'all' || type === 'products') {
      // Get product recommendations based on user preferences and history
      const productRecommendations = await getProductRecommendations(req.user);
      recommendations.products = productRecommendations;
    }

    if (type === 'all' || type === 'artisans') {
      // Get artisan recommendations
      const artisanRecommendations = await getArtisanRecommendations(req.user);
      recommendations.artisans = artisanRecommendations;
    }

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations'
    });
  }
});

// Helper functions

async function generateAIResponse(message, chatSession, user) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Simple intent detection (in real implementation, use Google Cloud NLU)
    let response = {
      content: '',
      metadata: {
        intent: 'general',
        confidence: 0.8
      },
      context: {},
      recommendations: {}
    };

    if (lowerMessage.includes('custom') || lowerMessage.includes('design') || lowerMessage.includes('create')) {
      response.content = "I can help you create a custom design! Please describe what you'd like - for example, 'I want a ceramic vase with blue patterns' or 'Create a wooden coffee table with modern style'. You can also specify materials, colors, and size preferences.";
      response.metadata.intent = 'design_request';
      
      // Get simple product suggestions
      try {
        const productSuggestions = await Product.find({ isActive: true })
          .limit(3)
          .select('name images pricing category')
          .lean();
        response.recommendations.products = productSuggestions;
      } catch (err) {
        console.log('Product suggestions error:', err.message);
        response.recommendations.products = [];
      }
      
    } else if (lowerMessage.includes('artisan') || lowerMessage.includes('craftsman') || lowerMessage.includes('maker')) {
      response.content = "I can help you find the perfect artisan for your project! Let me show you some talented craftspeople. What type of craft are you interested in?";
      response.metadata.intent = 'artisan_search';
      
      try {
        const artisanSuggestions = await Artisan.find({ 'availability.isActive': true })
          .limit(4)
          .select('businessInfo skills ratings')
          .populate('user', 'name')
          .lean();
        response.recommendations.artisans = artisanSuggestions;
      } catch (err) {
        console.log('Artisan suggestions error:', err.message);
        response.recommendations.artisans = [];
      }
      
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
      response.content = "I can help you find crafts within your budget! Our artisans offer a wide range of pricing options. Could you tell me your preferred price range? For example, 'under $100' or 'between $200-500'?";
      response.metadata.intent = 'pricing_inquiry';
      
    } else {
      response.content = "I'm here to help you discover amazing handcrafted items and connect with talented artisans! You can ask me to:\n\n• Create custom designs ('design a ceramic bowl')\n• Find artisans ('show me woodworkers')\n• Suggest products ('recommend leather bags')\n• Help with materials and pricing\n\nWhat would you like to explore today?";
      response.metadata.intent = 'greeting';
    }

    return response;
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    return {
      content: "I'm here to help! Please let me know what you're looking for.",
      metadata: { intent: 'fallback', confidence: 0.5 },
      context: {},
      recommendations: {}
    };
  }
}

async function findMatchingArtisans(aiDesign) {
  try {
    const category = aiDesign.category || 'Art';
    
    // Simple query to find active artisans
    const matchingArtisans = await Artisan.find({
      'availability.isActive': true
    })
      .populate('user', 'name')
      .limit(5)
      .lean();

    return matchingArtisans.map((artisan, index) => ({
      artisan: artisan._id,
      matchScore: Math.random() * 0.4 + 0.6, // Mock score between 0.6-1.0
      reasons: [`Specializes in ${category}`, 'Highly rated artisan', 'Available for custom work'],
      estimatedPrice: {
        min: 50 + Math.random() * 100,
        max: 200 + Math.random() * 300
      },
      estimatedTime: ['1-2 weeks', '2-3 weeks', '3-4 weeks'][index % 3]
    }));
  } catch (error) {
    console.error('Error in findMatchingArtisans:', error);
    return [];
  }
}

async function getProductRecommendations(user) {
  // Simple recommendation based on user preferences
  const preferences = user.profile?.preferences || {};
  const filter = { isActive: true };
  
  if (preferences.categories && preferences.categories.length > 0) {
    filter.category = { $in: preferences.categories };
  }

  return await Product.find(filter)
    .populate('artisan', 'user businessInfo')
    .sort({ 'ratings.average': -1 })
    .limit(6)
    .lean();
}

async function getArtisanRecommendations(user) {
  return await Artisan.find({ 'availability.isActive': true })
    .populate('user', 'name profile.avatar')
    .sort({ 'ratings.average': -1 })
    .limit(4)
    .lean();
}

module.exports = router;