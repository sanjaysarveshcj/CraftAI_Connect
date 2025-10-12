async function generateModel(prompt, options = { textured: false, highRes: true, polygons: 50000 }) {
  try {
    console.log('🚀 Starting 3D model generation...');
    console.log('📝 Prompt:', prompt);
    console.log('🎨 Options:', options);
    
    // Dynamic import for ES Module
    console.log('📦 Loading Meshifi AI module...');
    const meshifai = await import('@0xretrodev/meshifai');
    
    // Prepare options based on whether textured or untextured
    const meshifaiOptions = {};
    
    if (options.textured) {
      // For textured models, use polygon count for quality control
      meshifaiOptions.textured = true;
      meshifaiOptions.polygons = options.polygons || 50000; // Default to 50k for high quality
      console.log('⚙️ Calling Meshifi textTo3d API (textured mode)...');
      console.log('🔺 Polygon count:', meshifaiOptions.polygons);
    } else {
      // For untextured models, use highRes parameter
      meshifaiOptions.textured = false;
      meshifaiOptions.highRes = options.highRes !== undefined ? options.highRes : true; // Default to high res
      console.log('⚙️ Calling Meshifi textTo3d API (untextured mode)...');
      console.log('📐 High resolution:', meshifaiOptions.highRes);
    }
    
    const result = await meshifai.default.textTo3d(prompt, meshifaiOptions);
    
    console.log('✅ 3D model generated successfully!');
    console.log('🔗 Model URL:', result.modelUrl);
    
    return {
      success: true,
      modelUrl: result.modelUrl,
      modelType: options.textured ? 'textured' : 'untextured',
      quality: options.textured ? `${meshifaiOptions.polygons} polygons` : (meshifaiOptions.highRes ? 'high-res' : 'standard')
    };
  } catch (error) {
    console.error('❌ Meshifi AI Error:', error);
    console.error('Error details:', error.message);
    
    // Fallback to demo model for development/testing
    console.warn('⚠️ Meshifi service unavailable, using fallback demo 3D model...');
    return {
      success: true,
      modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      isDemo: true,
      demoNote: 'This is a demo model. Meshifi service is currently unavailable.',
      originalError: error.message
    };
  }
}

module.exports = {
  generateModel
};