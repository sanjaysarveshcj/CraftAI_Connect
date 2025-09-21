const { GoogleGenerativeAI } = require('@google/generative-ai');
const craftArtisanStoryPrompt = require('./prompts/craftArtisanStory');

class GeminiService {
  constructor() {
    // Initialize Gemini AI - you'll need to set your API key in environment variables
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables. AI features will use mock responses.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.textModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      // Note: Image generation with Gemini requires special access
      // For now, we'll use text generation and provide placeholder images
      this.imageModel = null; // Would be: this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-vision" });
    }
  }

  async generateChatResponse(message, context = {}) {
    if (!this.genAI) {
      return this.getMockChatResponse(message);
    }

    try {
      // Create a crafts-focused prompt
      const prompt = this.buildChatPrompt(message, context);
      
      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        message: text,
        sessionId: context.sessionId || `session_${Date.now()}`,
        recommendedProducts: [],
        recommendedArtisans: []
      };
    } catch (error) {
      console.error('Gemini AI Error:', error);
      return this.getMockChatResponse(message);
    }
  }

  async generateDesign(prompt, style, category) {
    if (!this.genAI) {
      return this.getMockDesignResponse(prompt, style, category);
    }

    try {
      const designPrompt = this.buildDesignPrompt(prompt, style, category);
      
      const result = await this.textModel.generateContent(designPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response to extract design details
      const designResult = this.parseDesignResponse(text, prompt, style, category);
      
      // Generate design image description for visualization
      const imagePrompt = this.buildImagePrompt(prompt, style, category);
      designResult.imagePrompt = imagePrompt;
      designResult.generatedImage = {
        url: '/placeholder.svg', // Placeholder for now
        description: imagePrompt,
        alt: `AI generated design concept: ${prompt}`
      };

      return designResult;
    } catch (error) {
      console.error('Gemini Design Generation Error:', error);
      return this.getMockDesignResponse(prompt, style, category);
    }
  }

  buildChatPrompt(message, context) {
    return `You are an AI assistant for CraftConnect, an artisan marketplace platform. 
You are an expert in handcrafted items, traditional techniques, and artisan skills.

Your role is to help customers discover and connect with local artisans for custom crafts.

Context:
- Platform: Artisan marketplace for handmade, custom items
- Specialties: Pottery, woodworking, textiles, jewelry, glass art, leather goods, metalwork, ceramics
- Goal: Help customers find the right artisan and visualize their perfect custom piece

User message: "${message}"

Please provide a helpful, knowledgeable response that:
1. Shows deep understanding of craft materials and techniques
2. Asks specific, relevant questions about their vision
3. Describes items in vivid, visual detail when discussing possibilities
4. Suggests realistic options based on traditional craft methods
5. Guides them toward artisans who specialize in their needs
6. Uses craft terminology accurately but explains complex concepts

Be enthusiastic about handmade crafts and paint vivid pictures with your words. Help them visualize their dream piece through detailed descriptions of materials, textures, colors, and construction methods.

Respond as a master craftsperson who understands both the art and science of making beautiful, functional objects by hand.`;
  }

  buildDesignPrompt(prompt, style, category) {
    return `You are an expert craft design consultant and visual artist for CraftConnect marketplace.

User's Design Request:
- Description: "${prompt}"
- Preferred Style: ${style}
- Category: ${category}

Please generate a comprehensive design concept that includes:

1. VISUAL DESCRIPTION: Paint a detailed visual picture of this piece. Describe it as if you're looking at a high-quality photograph. Include:
   - Overall shape, proportions, and dimensions
   - Colors, textures, and surface finishes
   - Fine details and decorative elements
   - How light would interact with the materials
   - The emotional feeling the piece conveys

2. MATERIALS & CONSTRUCTION: Specify exact materials and explain how they would be used:
   - Primary and secondary materials
   - Joinery techniques or construction methods
   - Surface treatments and finishes
   - Hardware or functional elements

3. CRAFTSMANSHIP DETAILS: Describe the artisan techniques:
   - Hand-finishing touches
   - Tool marks or texture patterns
   - Unique handmade characteristics
   - Quality indicators visible to the eye

4. CUSTOMIZATION OPTIONS: List 4-5 specific ways this design could be personalized

5. PRACTICAL SPECIFICATIONS:
   - Realistic dimensions with measurements
   - Weight estimate
   - Functional considerations
   - Care and maintenance requirements

6. PRICING & TIMELINE:
   - Material cost factors
   - Labor time estimate
   - Complexity premium
   - Final price range and completion timeline

Write this as if you're creating a detailed commission brief for a master artisan. Be specific, technical, and visually descriptive. Make the reader able to clearly visualize the finished piece.`;
  }

  buildImagePrompt(prompt, style, category) {
    return `A high-quality, professional photograph of a ${style || 'traditional'} ${category || 'handcrafted item'}: ${prompt}. 
Shot in natural lighting with clean background, showcasing fine craftsmanship details, textures, and materials. 
Professional product photography style, suitable for an artisan marketplace. 
Focus on the handmade quality, unique characteristics, and artistic elements that make this piece special.`;
  }

  async generateDesignImage(prompt, style, category) {
    // For future implementation when Gemini image generation becomes available
    // This would integrate with Imagen or similar service
    const imagePrompt = this.buildImagePrompt(prompt, style, category);
    
    // For now, return a structured image request that could be used with other services
    return {
      prompt: imagePrompt,
      style: style,
      category: category,
      specifications: {
        width: 512,
        height: 512,
        quality: 'high',
        style: 'photographic'
      },
      // Placeholder URL - in production this would be the generated image
      url: '/placeholder.svg',
      alt: `AI generated design: ${prompt}`
    };
  }

  parseDesignResponse(aiResponse, originalPrompt, style, category) {
    // Parse the AI response and structure it for the frontend
    const lines = aiResponse.split('\n');
    let designDescription = '';
    let visualDescription = '';
    let materials = '';
    let customizationSuggestions = [];
    let priceRange = { min: 150, max: 400 };
    let timeline = '2-4 weeks';
    let dimensions = '';

    // Extract visual description (look for VISUAL DESCRIPTION section)
    const visualStart = lines.findIndex(line => 
      line.toLowerCase().includes('visual') && line.toLowerCase().includes('description')
    );
    if (visualStart !== -1) {
      // Get the next few lines after VISUAL DESCRIPTION
      for (let i = visualStart + 1; i < Math.min(visualStart + 8, lines.length); i++) {
        if (lines[i] && !lines[i].match(/^\d+\./)) {
          visualDescription += lines[i] + ' ';
        } else if (lines[i] && lines[i].match(/^\d+\./)) {
          break; // Hit next section
        }
      }
    }

    // Use visual description as main description, fallback to first substantial content
    if (visualDescription.trim()) {
      designDescription = visualDescription.trim();
    } else {
      // Fallback: use first substantial paragraph
      const descriptionStart = lines.findIndex(line => 
        line.toLowerCase().includes('design') || line.toLowerCase().includes('concept')
      );
      if (descriptionStart !== -1 && descriptionStart + 1 < lines.length) {
        designDescription = lines[descriptionStart + 1] || aiResponse.substring(0, 400) + '...';
      } else {
        designDescription = aiResponse.substring(0, 400) + '...';
      }
    }

    // Extract materials information
    const materialsStart = lines.findIndex(line => 
      line.toLowerCase().includes('material') && line.toLowerCase().includes('construction')
    );
    if (materialsStart !== -1) {
      for (let i = materialsStart + 1; i < Math.min(materialsStart + 5, lines.length); i++) {
        if (lines[i] && !lines[i].match(/^\d+\./)) {
          materials += lines[i] + ' ';
        } else if (lines[i] && lines[i].match(/^\d+\./)) {
          break;
        }
      }
    }

    // Extract customization suggestions (look for lists or bullet points)
    lines.forEach(line => {
      if ((line.includes('-') || line.includes('•')) && (
        line.toLowerCase().includes('custom') || 
        line.toLowerCase().includes('option') ||
        line.toLowerCase().includes('variation') ||
        line.toLowerCase().includes('personali')
      )) {
        const suggestion = line.replace(/^[-•*]\s*/, '').trim();
        if (suggestion && customizationSuggestions.length < 6) {
          customizationSuggestions.push(suggestion);
        }
      }
    });

    // Extract dimensions
    const dimensionMatches = aiResponse.match(/(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(?:x|×)?\s*(\d+(?:\.\d+)?)?\s*(inches?|feet?|ft|in|cm|mm)/gi);
    if (dimensionMatches && dimensionMatches.length > 0) {
      dimensions = dimensionMatches[0];
    }

    // Enhanced price detection
    const priceMatches = aiResponse.match(/\$(\d+)(?:\s*-\s*\$?(\d+))?/g);
    if (priceMatches && priceMatches.length > 0) {
      const numbers = priceMatches[0].match(/\d+/g);
      if (numbers) {
        priceRange.min = parseInt(numbers[0]);
        priceRange.max = parseInt(numbers[1]) || priceRange.min * 2.5;
      }
    }

    // Enhanced timeline detection
    const timelineMatch = aiResponse.match(/(\d+(?:-\d+)?)\s*(weeks?|days?|months?)/i);
    if (timelineMatch) {
      timeline = timelineMatch[0];
    }

    // Default customization suggestions if none found
    if (customizationSuggestions.length === 0) {
      customizationSuggestions = [
        'Custom dimensions to fit your space',
        'Choice of wood species or materials', 
        'Personalized engraving or marking',
        'Custom finish or color options',
        'Hardware and accent variations'
      ];
    }

    return {
      id: `design_${Date.now()}`,
      designDescription: designDescription.trim(),
      visualDescription: visualDescription.trim(),
      materials: materials.trim(),
      dimensions: dimensions,
      suggestedArtisans: this.getMatchingArtisans(category, style),
      customizationSuggestions,
      estimatedPrice: priceRange,
      timeline,
      fullAiResponse: aiResponse, // Keep full response for reference
      imagePrompt: this.buildImagePrompt(originalPrompt, style, category),
      status: 'generated'
    };
  }

  buildImagePrompt(originalPrompt, style, category) {
    // Build a detailed image generation prompt for future image API integration
    const basePrompt = `High-quality photograph of a handcrafted ${category} in ${style} style. `;
    const detailPrompt = `Professional product photography with good lighting, showing fine craftsmanship details, textures, and materials. `;
    const specificPrompt = `Based on: ${originalPrompt}. `;
    const stylePrompt = `Shot on a clean background, studio lighting, high resolution, detailed textures visible.`;
    
    return basePrompt + detailPrompt + specificPrompt + stylePrompt;
  }

  getMatchingArtisans(category, style) {
    // Mock artisan suggestions based on category and style
    const artisans = [
      {
        _id: 'artisan_1',
        name: 'Maria Rodriguez',
        bio: 'Expert ceramic artist with 15 years of experience in traditional pottery and modern designs.',
        specialties: ['Ceramics', 'Pottery', 'Glazing'],
        location: 'Santa Fe, NM',
        rating: 4.8,
        portfolio: ['/placeholder.svg', '/placeholder.svg']
      },
      {
        _id: 'artisan_2', 
        name: 'David Chen',
        bio: 'Master woodworker specializing in custom furniture and decorative pieces.',
        specialties: ['Woodworking', 'Furniture', 'Carving'],
        location: 'Portland, OR',
        rating: 4.9,
        portfolio: ['/placeholder.svg', '/placeholder.svg']
      },
      {
        _id: 'artisan_3',
        name: 'Sarah Johnson',
        bio: 'Textile artist creating unique woven pieces and custom fabric designs.',
        specialties: ['Textiles', 'Weaving', 'Dyeing'],
        location: 'Austin, TX',
        rating: 4.7,
        portfolio: ['/placeholder.svg', '/placeholder.svg']
      }
    ];

    // Return 2-3 relevant artisans based on category
    return artisans.slice(0, 2);
  }

  getMockChatResponse(message) {
    return {
      message: `I understand you're interested in "${message}". As your AI craft assistant, I can help you find the perfect artisan for your custom project. 

What specific type of craft are you looking for? We have skilled artisans specializing in:
• Ceramics & Pottery
• Woodworking & Furniture  
• Textiles & Fabrics
• Jewelry & Metalwork
• Glass Art & Stained Glass
• Leather Goods

Feel free to describe your vision in detail - the more specific you are about materials, size, colors, and intended use, the better I can match you with the right craftsperson!`,
      sessionId: `session_${Date.now()}`,
      recommendedProducts: [],
      recommendedArtisans: []
    };
  }

  getMockDesignResponse(prompt, style, category) {
    return {
      id: `design_${Date.now()}`,
      designDescription: `Beautiful ${style || 'traditional'} ${category || 'art'} piece based on your description: "${prompt}". This handcrafted item will feature authentic materials and expert craftsmanship, perfectly suited for your needs.`,
      suggestedArtisans: this.getMatchingArtisans(category, style),
      customizationSuggestions: [
        'Custom size options',
        'Color variations', 
        'Personalized engraving',
        'Different materials',
        'Matching accessories'
      ],
      estimatedPrice: {
        min: 150,
        max: 300
      },
      timeline: '2-3 weeks',
      status: 'generated'
    };
  }
}

module.exports = new GeminiService();