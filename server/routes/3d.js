// const express = require('express');
// const router = express.Router();
// const { authenticate } = require('../middleware/auth');
// const meshifiService = require('../services/meshifiService');
// const AIDesign = require('../models/AIDesign');

// // @route   POST /api/3d/generate
// // @desc    Generate 3D model from text prompt
// // @access  Private
// router.post('/generate', authenticate, async (req, res) => {
//   try {
//     console.log('\n=== 3D Model Generation Request ===');
//     console.log('User ID:', req.user._id);
//     console.log('Request body:', req.body);
    
//     const { 
//       prompt, 
//       textured = false, 
//       style, 
//       category,
//       highRes = true,      // Default to high resolution for untextured models
//       polygons = 50000     // Default to 50k polygons for textured models (high quality)
//     } = req.body;

//     if (!prompt) {
//       console.log('⚠️ No prompt provided');
//       return res.status(400).json({
//         success: false,
//         message: 'Prompt is required'
//       });
//     }

//     console.log('🔧 Calling Meshifi service...');
//     console.log('   Textured:', textured);
//     console.log('   Quality:', textured ? `${polygons} polygons` : (highRes ? 'high-res' : 'standard'));
    
//     const result = await meshifiService.generateModel(prompt, { 
//       textured, 
//       highRes, 
//       polygons 
//     });

//     console.log('💾 Saving design to database...');
//     // Save the design to database
//     const design = new AIDesign({
//       user: req.user._id,
//       prompt: prompt,
//       generatedImage: {
//         url: result.modelUrl,
//         metadata: {
//           model: 'meshifi',
//           parameters: { textured },
//           processingTime: 0
//         }
//       },
//       style: style,
//       category: category,
//       status: 'generated',
//       tags: ['3d-model', style || 'default'].filter(Boolean)
//     });

//     await design.save();
//     console.log('✅ Design saved with ID:', design._id);

//     console.log('📤 Sending response to client...');
//     res.json({
//       success: true,
//       data: {
//         modelUrl: result.modelUrl,
//         designId: design._id,
//         prompt: prompt,
//         modelType: result.modelType,
//         quality: result.quality,
//         isDemo: result.isDemo || false,
//         message: result.isDemo 
//           ? 'Using demo model - Meshifi service is currently unavailable' 
//           : `3D model generated successfully (${result.modelType}, ${result.quality})`
//       }
//     });
//     console.log('=== Request completed successfully ===\n');
//   } catch (error) {
//     console.error('\n❌ 3D Generation Error:', error);
//     console.error('Error stack:', error.stack);
//     console.error('=== Request failed ===\n');
//     res.status(500).json({
//       success: false,
//       message: 'Failed to generate 3D model',
//       error: error.message
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const meshifiService = require('../services/meshifiService');
const AIDesign = require('../models/AIDesign');

// @route   POST /api/3d/generate
// @desc    Generate 3D model from text prompt
// @access  Private
router.post('/generate', authenticate, async (req, res) => {
  try {
    console.log('\n=== 3D Model Generation Request ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    
    const { 
      prompt, 
      textured = false, 
      style, 
      category,
      highRes = true,      // Default to high resolution for untextured models
      polygons = 50000     // Default to 50k polygons for textured models (high quality)
    } = req.body;

    if (!prompt) {
      console.log('⚠ No prompt provided');
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('🔧 Calling Meshifi service...');
    console.log('   Textured:', textured);
    console.log('   Quality:', textured ? `${polygons} polygons` : (highRes ? 'high-res' : 'standard'));
    
    const result = await meshifiService.generateModel(prompt, { 
      textured, 
      highRes: false, // Set to false for better reliability
      polygons: textured ? 30000 : undefined // Reduced polygon count for better reliability
    });

    console.log('💾 Saving design to database...');
    // Save the design to database
    const design = new AIDesign({
      user: req.user._id,
      prompt: prompt,
      generatedImage: {
        url: result.modelUrl,
        metadata: {
          model: 'meshifi',
          parameters: { textured },
          processingTime: 0
        }
      },
      style: style,
      category: category,
      status: 'generated',
      tags: ['3d-model', style || 'default'].filter(Boolean)
    });

    await design.save();
    console.log('✅ Design saved with ID:', design._id);

    console.log('📤 Sending response to client...');
    res.json({
      success: true,
      data: {
        modelUrl: result.modelUrl,
        designId: design._id,
        prompt: prompt,
        modelType: result.modelType,
        quality: result.quality,
        isDemo: result.isDemo || false,
        message: result.isDemo 
          ? 'Using demo model - Meshifi service is currently unavailable' 
          : `3D model generated successfully (${result.modelType}, ${result.quality})`
      }
    });
    console.log('=== Request completed successfully ===\n');
  } catch (error) {
    console.error('\n❌ 3D Generation Error:', error);
    console.error('Error stack:', error.stack);
    console.error('=== Request failed ===\n');
    
    // Provide more detailed error message
    let errorMessage = 'Failed to generate 3D model';
    let statusCode = 500;
    
    if (error.message.includes('completion data')) {
      errorMessage = 'Meshifi AI service is experiencing issues. The service may be temporarily unavailable or overloaded. Please try again in a few moments.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'The 3D generation request timed out. Please try a simpler prompt or try again later.';
      statusCode = 504;
    } else if (error.message.includes('Invalid response')) {
      errorMessage = 'Received an invalid response from Meshifi AI. Please try again.';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      suggestion: 'Try using a simpler, more descriptive prompt (e.g., "modern wooden chair" instead of complex descriptions)'
    });
  }
});

module.exports = router;