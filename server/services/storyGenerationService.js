const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate } = require('../middleware/auth');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateArtisanStory(artisanDetails) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
Create a compelling and professional story about an artisan based on the following details:
- Business Name: ${artisanDetails.businessName}
- Primary Craft: ${artisanDetails.primaryCraft}
- Years of Experience: ${artisanDetails.yearsOfExperience}
- Inspiration: ${artisanDetails.inspiration}
- Unique Value: ${artisanDetails.uniqueValue}
- Signature Style/Technique: ${artisanDetails.signature}
- Challenges Overcome: ${artisanDetails.challenges}
- Notable Achievements: ${artisanDetails.achievements}
- Business Mission: ${artisanDetails.mission}

Write a engaging 2-3 paragraph story that highlights their journey, expertise, and what makes them unique. Focus on their passion, craftsmanship, and dedication to their art. Make it personal yet professional.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Story generation error:', error);
    throw error;
  }
}

// Generate story for artisan
router.post('/generate-story', authenticate, async (req, res) => {
  try {
    const artisanDetails = req.body;
    const story = await generateArtisanStory(artisanDetails);
    
    res.json({
      success: true,
      data: { story }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating artisan story',
      error: error.message
    });
  }
});

module.exports = router;