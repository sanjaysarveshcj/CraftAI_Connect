import api from './api';
import { ArtisanProfessionalDetails } from '@/types/artisan';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'artisan';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: {
    avatar?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    preferences?: {
      categories?: string[];
      priceRange?: {
        min: number;
        max: number;
      };
    };
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export const authAPI = {
  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User['profile']>): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Logout (client-side only - clear token)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Update artisan professional details
  updateArtisanDetails: async (details: ArtisanProfessionalDetails): Promise<{ success: boolean; data: { user: User; story: string } }> => {
    // First, generate the story
    const storyResponse = await api.post('/ai/artisan-story', { details });
    
    // If story generation successful, update artisan details
    if (storyResponse.data.success) {
      const response = await api.put('/auth/artisan-details', {
        ...details,
        generatedStory: storyResponse.data.data.story
      });
      return response.data;
    }
    
    throw new Error('Failed to generate artisan story');
  }
};