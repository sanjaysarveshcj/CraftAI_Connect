const Replicate = require('replicate');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateImage(prompt) {
  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: prompt,
          width: 768,
          height: 768,
          num_outputs: 1,
          scheduler: "DPMSolverMultistep",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          prompt_strength: 0.8,
        },
      }
    );

    // The output will be an array of image URLs
    return output[0];
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

module.exports = {
  generateImage
};