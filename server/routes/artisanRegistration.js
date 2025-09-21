const express = require('express');
const router = express.Router();
const Artisan = require('../models/Artisan');
const { authenticate } = require('../middleware/auth');
const storyGenerationService = require('../services/storyGenerationService');

// Register new artisan with story generation
router.post('/register', authenticate, async (req, res) => {
  try {
    const {
      businessName,
      description,
      primaryCraft,
      specialties,
      yearsOfExperience,
      city,
      state,
      address,
      hourlyRate,
      // New fields for story generation
      inspiration,
      uniqueValue,
      signature,
      challenges,
      achievements,
      mission
    } = req.body;

    // Generate story using Gemini
    const story = await storyGenerationService.generateArtisanStory({
      businessName,
      primaryCraft,
      yearsOfExperience,
      inspiration,
      uniqueValue,
      signature,
      challenges,
      achievements,
      mission
    });

    // Create artisan with story
    const artisan = new Artisan({
      user: req.user._id,
      businessInfo: {
        businessName,
        description,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        inspiration,
        uniqueValue,
        signature,
        challenges,
        achievements,
        mission,
        story
      },
      skills: {
        primaryCraft,
        specialties: specialties.split(',').map(s => s.trim())
      },
      location: {
        city,
        state,
        address
      },
      pricing: {
        hourlyRate: parseFloat(hourlyRate) || 0
      }
    });

    await artisan.save();

    res.status(201).json({
      success: true,
      message: 'Artisan registered successfully',
      data: artisan
    });
  } catch (error) {
    console.error('Artisan registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering artisan',
      error: error.message
    });
  }
});

module.exports = router;