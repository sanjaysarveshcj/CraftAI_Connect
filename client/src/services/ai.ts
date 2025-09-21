import api from './api';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    entities?: any;
  };
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  context: {
    userPreferences: any;
    generatedDesigns: any[];
    recommendedProducts: any[];
    recommendedArtisans: any[];
  };
}

export interface ChatResponse {
  success: boolean;
  data: {
    sessionId: string;
    message: string;
    context: any;
    recommendations: {
      products?: any[];
      artisans?: any[];
    };
  };
}

export interface AIDesign {
  _id: string;
  prompt: string;
  generatedImage: {
    url: string;
    metadata: {
      model: string;
      parameters: any;
      processingTime: number;
    };
  };
  style: string;
  category: string;
  specifications: any;
  matchedArtisans: Array<{
    artisan: string;
    matchScore: number;
    reasons: string[];
    estimatedPrice: {
      min: number;
      max: number;
    };
    estimatedTime: string;
  }>;
  status: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DesignGenerationRequest {
  prompt: string;
  style?: string;
  category?: string;
  specifications?: any;
}

export interface AIRecommendations {
  success: boolean;
  data: {
    products?: any[];
    artisans?: any[];
  };
}

export const aiAPI = {
  // Send message to AI chat
  sendChatMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    const response = await api.post('/ai/chat', { message, sessionId });
    return response.data;
  },

  // Get chat history
  getChatHistory: async (sessionId: string): Promise<{ success: boolean; data: ChatSession }> => {
    const response = await api.get(`/ai/chat/${sessionId}`);
    return response.data;
  },

  // Generate AI design
  generateDesign: async (designData: DesignGenerationRequest): Promise<{ success: boolean; data: { design: AIDesign; matchedArtisans: any[]; message: string } }> => {
    const response = await api.post('/ai/generate-design', designData);
    return response.data;
  },

  // Get user's AI designs
  getDesigns: async (page: number = 1, limit: number = 12): Promise<{ success: boolean; data: { designs: AIDesign[]; pagination: any } }> => {
    const response = await api.get(`/ai/designs?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get AI recommendations
  getRecommendations: async (type: 'all' | 'products' | 'artisans' = 'all'): Promise<AIRecommendations> => {
    const response = await api.get(`/ai/recommendations?type=${type}`);
    return response.data;
  }
};