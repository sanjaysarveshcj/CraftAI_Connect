const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Message, Conversation } = require('../models/Conversation');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const AIDesign = require('../models/AIDesign');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active' } = req.query;
    
    const filter = {
      'participants.user': req.user._id,
      status: status
    };

    const skip = (page - 1) * limit;
    
    const conversations = await Conversation.find(filter)
      .populate('participants.user', 'name profile.avatar')
      .populate('artisan', 'businessInfo user')
      .populate('customer', 'name profile')
      .populate('lastMessage')
      .populate('relatedProduct', 'name images pricing')
      .populate('relatedDesign', 'prompt generatedImage')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Add unread message count for each conversation
    for (let conversation of conversations) {
      const unreadCount = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        isRead: false
      });
      conversation.unreadCount = unreadCount;
    }

    const total = await Conversation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / limit),
          count: conversations.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations'
    });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get conversation details with messages
// @access  Private
router.get('/conversations/:id', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const conversationId = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID format'
      });
    }
    
    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': req.user._id
    })
      .populate('participants.user', 'name profile.avatar')
      .populate('artisan', 'businessInfo user ratings')
      .populate('customer', 'name profile')
      .populate('relatedProduct', 'name images pricing artisan')
      .populate('relatedDesign', 'prompt generatedImage category style');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Get messages for this conversation
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name profile.avatar')
      .populate('metadata.orderId', 'orderNumber status totalAmount')
      .populate('metadata.productId', 'name images pricing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Mark messages as read for current user
    const updateResult = await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    // Update user's last seen timestamp
    await Conversation.updateOne(
      {
        _id: conversation._id,
        'participants.user': req.user._id
      },
      {
        $set: {
          'participants.$.lastSeenAt': new Date()
        }
      }
    );

    const totalMessages = await Message.countDocuments({ conversation: conversation._id });
    
    const responseData = {
      success: true,
      data: {
        conversation,
        messages: messages.reverse(), // Show oldest first
        pagination: {
          current: Number(page),
          total: Math.ceil(totalMessages / limit),
          count: messages.length,
          totalItems: totalMessages
        }
      }
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversation'
    });
  }
});

// @route   POST /api/messages/conversations
// @desc    Start new conversation with artisan
// @access  Private
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { artisanId, subject, initialMessage, relatedProductId, relatedDesignId } = req.body;

    if (!artisanId || !initialMessage) {
      return res.status(400).json({
        success: false,
        message: 'Artisan ID and initial message are required'
      });
    }

    // Verify artisan exists
    const artisan = await Artisan.findById(artisanId).populate('user');
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      artisan: artisanId,
      customer: req.user._id,
      status: 'active'
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [
          { user: req.user._id, role: 'customer' },
          { user: artisan.user._id, role: 'artisan' }
        ],
        artisan: artisanId,
        customer: req.user._id,
        subject: subject || 'Product Inquiry',
        relatedProduct: relatedProductId,
        relatedDesign: relatedDesignId
      });
      await conversation.save();
    }

    // Create initial message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content: initialMessage,
      messageType: 'text'
    });
    await message.save();

    // Update conversation with last message
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Populate conversation for response
    await conversation.populate('participants.user', 'name profile.avatar');
    await conversation.populate('artisan', 'businessInfo user');

    res.status(201).json({
      success: true,
      message: 'Conversation started successfully',
      data: {
        conversation,
        initialMessage: message
      }
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting conversation'
    });
  }
});

// @route   POST /api/messages/conversations/:id/messages
// @desc    Send message in conversation
// @access  Private
router.post('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { content, messageType = 'text', attachments = [], metadata = {} } = req.body;
    const conversationId = req.params.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID format'
      });
    }

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Create message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content,
      messageType,
      attachments,
      metadata
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Populate message for response
    await message.populate('sender', 'name profile.avatar');
    if (message.metadata.orderId) {
      await message.populate('metadata.orderId', 'orderNumber status totalAmount');
    }
    if (message.metadata.productId) {
      await message.populate('metadata.productId', 'name images pricing');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   POST /api/messages/conversations/:id/order-request
// @desc    Send order request through conversation
// @access  Private
router.post('/conversations/:id/order-request', authenticate, async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      customization = {},
      specifications = {},
      requestedPrice,
      timeline,
      message: customerMessage
    } = req.body;

    // Verify conversation exists and user is customer
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      customer: req.user._id
    }).populate('artisan');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Verify product belongs to artisan
    const product = await Product.findOne({
      _id: productId,
      artisan: conversation.artisan._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available from this artisan'
      });
    }

    // Create order request message
    const orderRequestMessage = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content: customerMessage || `I would like to order ${product.name}`,
      messageType: 'order_request',
      metadata: {
        productId: product._id,
        orderDetails: {
          quantity,
          customization,
          specifications,
          estimatedPrice: requestedPrice ? {
            min: requestedPrice.min,
            max: requestedPrice.max
          } : {
            min: product.pricing.basePrice * quantity,
            max: product.pricing.basePrice * quantity * 1.5
          },
          timeline
        }
      }
    });

    await orderRequestMessage.save();

    // Update conversation
    conversation.lastMessage = orderRequestMessage._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Populate message for response
    await orderRequestMessage.populate('sender', 'name profile.avatar');
    await orderRequestMessage.populate('metadata.productId', 'name images pricing');

    res.status(201).json({
      success: true,
      message: 'Order request sent successfully',
      data: {
        message: orderRequestMessage
      }
    });
  } catch (error) {
    console.error('Send order request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending order request'
    });
  }
});

// @route   POST /api/messages/conversations/:id/order-response
// @desc    Artisan responds to order request
// @access  Private (Artisan only)
router.post('/conversations/:id/order-response', authenticate, async (req, res) => {
  try {
    const {
      messageId, // Original order request message
      accepted,
      responseMessage,
      finalPrice,
      estimatedDelivery,
      terms
    } = req.body;

    // Verify conversation exists and user is artisan
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': req.user._id
    }).populate('artisan');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Verify user is the artisan in this conversation
    const artisan = await Artisan.findOne({ user: req.user._id });
    if (!artisan || artisan._id.toString() !== conversation.artisan._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the artisan can respond to order requests'
      });
    }

    // Get original order request message
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage || originalMessage.messageType !== 'order_request') {
      return res.status(404).json({
        success: false,
        message: 'Original order request message not found'
      });
    }

    let orderId = null;

    // If accepted, create order
    if (accepted) {
      const orderData = {
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        customer: conversation.customer,
        items: [{
          product: originalMessage.metadata.productId,
          artisan: artisan._id,
          quantity: originalMessage.metadata.orderDetails.quantity,
          price: finalPrice || originalMessage.metadata.orderDetails.estimatedPrice.min,
          customization: originalMessage.metadata.orderDetails.customization,
          specifications: originalMessage.metadata.orderDetails.specifications,
          estimatedDelivery: estimatedDelivery
        }],
        pricing: {
          subtotal: finalPrice || originalMessage.metadata.orderDetails.estimatedPrice.min,
          tax: 0,
          shipping: 0,
          total: finalPrice || originalMessage.metadata.orderDetails.estimatedPrice.min,
          totalAmount: finalPrice || originalMessage.metadata.orderDetails.estimatedPrice.min
        },
        status: 'confirmed',
        confirmedAt: new Date()
      };

      const order = new Order(orderData);
      await order.save();
      orderId = order._id;

      // Add order to conversation
      conversation.orders.push(order._id);
      await conversation.save();
    }

    // Create response message
    const responseMsg = new Message({
      conversation: conversation._id,
      sender: req.user._id,
      content: responseMessage || (accepted ? 'Order accepted!' : 'Order declined'),
      messageType: 'order_response',
      metadata: {
        orderId: orderId,
        productId: originalMessage.metadata.productId,
        originalMessageId: messageId,
        accepted,
        finalPrice,
        estimatedDelivery,
        terms
      }
    });

    await responseMsg.save();

    // Update conversation
    conversation.lastMessage = responseMsg._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Populate response
    await responseMsg.populate('sender', 'name profile.avatar');
    if (orderId) {
      await responseMsg.populate('metadata.orderId', 'orderNumber status totalAmount');
    }

    res.status(201).json({
      success: true,
      message: `Order request ${accepted ? 'accepted' : 'declined'} successfully`,
      data: {
        message: responseMsg,
        order: orderId ? await Order.findById(orderId).populate('items.product') : null
      }
    });
  } catch (error) {
    console.error('Order response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to order request'
    });
  }
});

// @route   PUT /api/messages/conversations/:id/archive
// @desc    Archive conversation
// @access  Private
router.put('/conversations/:id/archive', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: req.params.id,
        'participants.user': req.user._id
      },
      { status: 'archived' },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while archiving conversation'
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count for user
// @access  Private
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Message.aggregate([
      {
        $lookup: {
          from: 'conversations',
          localField: 'conversation',
          foreignField: '_id',
          as: 'conversationData'
        }
      },
      {
        $match: {
          'conversationData.participants.user': req.user._id,
          sender: { $ne: req.user._id },
          isRead: false
        }
      },
      {
        $count: 'unreadMessages'
      }
    ]);

    const count = unreadCount[0]?.unreadMessages || 0;

    res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting unread count'
    });
  }
});

module.exports = router;