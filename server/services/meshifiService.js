// async function generateModel(prompt, options = { textured: false, highRes: true, polygons: 50000 }) {
//   try {
//     console.log('🚀 Starting 3D model generation...');
//     console.log('📝 Prompt:', prompt);
//     console.log('🎨 Options:', options);
    
//     // Dynamic import for ES Module
//     console.log('📦 Loading Meshifi AI module...');
//     const meshifai = await import('@0xretrodev/meshifai');
    
//     // Prepare options based on whether textured or untextured
//     const meshifaiOptions = {};
    
//     if (options.textured) {
//       // For textured models, use polygon count for quality control
//       meshifaiOptions.textured = true;
//       meshifaiOptions.polygons = options.polygons || 50000; // Default to 50k for high quality
//       console.log('⚙️ Calling Meshifi textTo3d API (textured mode)...');
//       console.log('🔺 Polygon count:', meshifaiOptions.polygons);
//     } else {
//       // For untextured models, use highRes parameter
//       meshifaiOptions.textured = false;
//       meshifaiOptions.highRes = options.highRes !== undefined ? options.highRes : true; // Default to high res
//       console.log('⚙️ Calling Meshifi textTo3d API (untextured mode)...');
//       console.log('📐 High resolution:', meshifaiOptions.highRes);
//     }
    
//     const result = await meshifai.default.textTo3d(prompt, meshifaiOptions);
    
//     console.log('✅ 3D model generated successfully!');
//     console.log('🔗 Model URL:', result.modelUrl);
    
//     return {
//       success: true,
//       modelUrl: result.modelUrl,
//       modelType: options.textured ? 'textured' : 'untextured',
//       quality: options.textured ? `${meshifaiOptions.polygons} polygons` : (meshifaiOptions.highRes ? 'high-res' : 'standard')
//     };
//   } catch (error) {
//     console.error('❌ Meshifi AI Error:', error);
//     console.error('Error details:', error.message);
    
//     // Fallback to demo model for development/testing
//     console.warn('⚠️ Meshifi service unavailable, using fallback demo 3D model...');
//     return {
//       success: true,
//       modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
//       isDemo: true,
//       demoNote: 'This is a demo model. Meshifi service is currently unavailable.',
//       originalError: error.message
//     };
//   }
// }

// module.exports = {
//   generateModel
// };

const axios = require('axios');

async function generateModel(prompt, options = { textured: false, highRes: true, polygons: 50000 }) {
  const maxRetries = 3;
  let lastError = null;

  // Test connectivity to Meshifi's Hugging Face API
  console.log('🔍 Testing connectivity to Meshifi AI service...');
  try {
    const testResponse = await axios.get('https://roblox-cube3d-interactive.hf.space/gradio_api/queue/status', {
      timeout: 5000
    });
    console.log('✅ Meshifi API is reachable');
  } catch (error) {
    console.warn('⚠ Meshifi API connectivity test failed:', error.message);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 Starting 3D model generation (Attempt ${attempt}/${maxRetries})...`);
      console.log('📝 Prompt:', prompt);
      console.log('🎨 Options:', options);
      
      // Dynamic import for ES Module
      console.log('📦 Loading Meshifi AI module...');
      const meshifai = await import('@0xretrodev/meshifai');
      
      // Always use untextured and standard quality for maximum reliability
      const meshifaiOptions = {
        textured: false,
        highRes: false
      };
      
      console.log('⚙ Calling Meshifi textTo3d API (untextured, standard quality)...');
      console.log('📐 Configuration:', meshifaiOptions);
      
      console.log('🔄 Making API call to Meshifi...');
      console.log('⏱ This may take 15-30 seconds...');
      
      const result = await meshifai.default.textTo3d(prompt, meshifaiOptions);
      
      console.log('📦 Raw result from Meshifi:', JSON.stringify(result, null, 2));
      
      // Check if we got a valid result
      if (!result || !result.modelUrl) {
        throw new Error('Invalid response from Meshifi: Missing modelUrl');
      }
      
      console.log('✅ 3D model generated successfully!');
      console.log('🔗 Model URL:', result.modelUrl);
      
      return {
        success: true,
        modelUrl: result.modelUrl,
        modelType: 'untextured',
        quality: 'standard',
        attemptNumber: attempt
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Meshifi AI Error (Attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        const waitTime = attempt * 3000; // Wait 3s, then 6s, then 9s
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // All retries failed
  console.error('❌ All retry attempts failed');
  console.error('Error stack:', lastError.stack);
  console.error('Error details:', lastError.message);
  
  // Check if it's a known Meshifi service issue
  if (lastError.message.includes('completion data')) {
    throw new Error(
      'Meshifi AI service (Hugging Face Space) is currently experiencing issues. ' +
      'This is likely due to:\n' +
      '1. The Hugging Face Space being in sleep mode (needs to wake up)\n' +
      '2. High traffic/server overload\n' +
      '3. Temporary service maintenance\n\n' +
      'Please wait 1-2 minutes and try again. If the issue persists, the service may be temporarily down.'
    );
  }
  
  throw new Error(`Failed to generate 3D model with Meshifi: ${lastError.message}`);
}

module.exports = {
  generateModel
};