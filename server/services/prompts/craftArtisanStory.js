const craftArtisanStoryPrompt = (details) => `
Generate a compelling professional story and profile for a craft artisan based on the following details:

Specialties: ${details.specialties.join(', ')}
Years of Experience: ${details.yearsOfExperience}
Business Background: ${details.businessBackground}
Notable Achievements: ${details.achievements}
Inspiration Story: ${details.inspirationStory}
Techniques and Materials: ${details.techniquesAndMaterials}
Custom Order Preferences: ${details.customOrderPreferences}

Please create an engaging narrative that highlights:
1. The artisan's journey and passion for their craft
2. Their unique expertise and specialties
3. Notable achievements and growth
4. Their approach to materials and techniques
5. What makes them unique in their field

The story should be:
- Professional but warm in tone
- Around 300-400 words
- Include relevant details from their background
- Highlight their expertise and unique value proposition
- Be engaging for potential customers

Make it personal but keep it focused on their professional craft journey and expertise.
`;

module.exports = craftArtisanStoryPrompt;