const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticate } = require('../middleware/auth');

// Tripo3D API Configuration
const TRIPO_API_KEY = process.env.TRIPO_API_KEY;
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi';

// Submit a new text-to-3D task
router.post('/task', authenticate, async (req, res) => {
  try {
    const { prompt, model_version = 'v3.0-20250812', texture = true, pbr = true } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prompt is required' 
      });
    }

    if (!TRIPO_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Tripo API key not configured' 
      });
    }

    const payload = {
      type: 'text_to_model',
      prompt,
      model_version,
      texture,
      pbr
    };

    const headers = {
      'Authorization': `Bearer ${TRIPO_API_KEY}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.post(`${TRIPO_BASE_URL}/task`, payload, { headers });

    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Tripo3D Task Submission Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to submit 3D generation task',
      error: error.response?.data || error.message
    });
  }
});

// Poll task status
router.get('/task/:taskId', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!TRIPO_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Tripo API key not configured' 
      });
    }

    const headers = {
      'Authorization': `Bearer ${TRIPO_API_KEY}`
    };

    const response = await axios.get(`${TRIPO_BASE_URL}/task/${taskId}`, { headers });

    res.json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Tripo3D Task Status Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to get task status',
      error: error.response?.data || error.message
    });
  }
});

// Cancel a task
router.delete('/task/:taskId', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!TRIPO_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Tripo API key not configured' 
      });
    }

    const headers = {
      'Authorization': `Bearer ${TRIPO_API_KEY}`
    };

    await axios.delete(`${TRIPO_BASE_URL}/task/${taskId}`, { headers });

    res.json({
      success: true,
      message: 'Task cancelled successfully'
    });
  } catch (error) {
    console.error('Tripo3D Task Cancellation Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to cancel task',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
