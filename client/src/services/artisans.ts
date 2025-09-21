import api from './api';

export interface Artisan {
  _id: string;
  user: {
    _id: string;
    name: string;
    profile?: {
      avatar?: string;
      phone?: string;
    };
  };
  businessInfo: {
    businessName: string;
    description?: string;
    yearsOfExperience?: number;
    certifications?: string[];
    establishedYear?: number;
    responseTime?: string;
  };
  skills: {
    primaryCraft: string;
    specialties: string[];
    techniques?: string[];
    materials?: string[];
    experienceLevel?: string;
    yearsOfExperience?: number;
  };
  location: {
    address?: string;
    city: string;
    state: string;
    coordinates?: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    serviceRadius?: number;
  };
  portfolio?: Array<{
    title: string;
    description: string;
    images: string[];
    category: string;
    price: number;
    completionTime: string;
    tags: string[];
  }>;
  pricing?: {
    hourlyRate?: number;
    projectMinimum?: number;
    minimumOrder?: number;
    consultationFee?: number;
    currency?: string;
  };
  availability: {
    isActive: boolean;
    workingHours?: {
      [key: string]: {
        start: string;
        end: string;
        isAvailable?: boolean;
      };
    };
    busyDates?: string[];
    unavailableDates?: string[];
  };
  ratings: {
    average: number;
    count: number;
    totalReviews?: number;
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  verification?: {
    isVerified?: boolean;
    documents?: string[];
    verifiedAt?: string;
  };
  distance?: number; // Added when location-based search is used
}

export interface ArtisansResponse {
  success: boolean;
  data: {
    artisans: Artisan[];
    pagination?: {
      current: number;
      total: number;
      count: number;
      totalItems: number;
    };
  };
}

export interface ArtisanFilters {
  search?: string;
  skill?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const artisansAPI = {
  // Get all artisans with filters
  getArtisans: async (filters: ArtisanFilters = {}): Promise<ArtisansResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/artisans?${params.toString()}`);
    return response.data;
  },

  // Search artisans by location name
  searchArtisans: async (location: string, radius: number = 25, limit: number = 10): Promise<ArtisansResponse> => {
    const params = new URLSearchParams({
      location,
      radius: radius.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`/artisans/search?${params.toString()}`);
    return response.data;
  },

  // Get nearby artisans by coordinates
  getNearbyArtisans: async (latitude: number, longitude: number, radius: number = 25, limit: number = 10): Promise<ArtisansResponse> => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      limit: limit.toString()
    });

    const response = await api.get(`/artisans/nearby?${params.toString()}`);
    return response.data;
  },

  // Get single artisan by ID
  getArtisan: async (id: string): Promise<{ success: boolean; data: { artisan: Artisan; products: any[] } }> => {
    const response = await api.get(`/artisans/${id}`);
    return response.data;
  },

  // Get artisan's products
  getArtisanProducts: async (id: string, page: number = 1, limit: number = 12): Promise<any> => {
    const response = await api.get(`/artisans/${id}/products?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get all artisan skills
  getSkills: async (): Promise<{ success: boolean; data: { skills: string[] } }> => {
    const response = await api.get('/artisans/skills');
    return response.data;
  },

  // Contact artisan
  contactArtisan: async (id: string, message: string, subject?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/artisans/${id}/contact`, { message, subject });
    return response.data;
  },

  // Check artisan registration status
  checkArtisanStatus: async (): Promise<{ success: boolean; data: { hasProfile: boolean; isComplete: boolean; artisan?: any } }> => {
    const response = await api.get('/artisan/status');
    return response.data;
  },

  // Register as artisan
  registerArtisan: async (artisanData: any): Promise<{ success: boolean; message: string; data: { artisan: any } }> => {
    const response = await api.post('/artisan/register', artisanData);
    return response.data;
  },

  // Get artisan dashboard data
  getArtisanDashboard: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/artisan/dashboard');
    return response.data;
  },

  // Get artisan profile for editing
  getArtisanProfile: async (): Promise<{ success: boolean; data: { artisan: any } }> => {
    const response = await api.get('/artisan/profile');
    return response.data;
  }
};

// Export individual functions for easier importing
export const getArtisans = artisansAPI.getArtisans;
export const searchArtisans = artisansAPI.searchArtisans;
export const getNearbyArtisans = artisansAPI.getNearbyArtisans;
export const getArtisan = artisansAPI.getArtisan;
export const getArtisanById = artisansAPI.getArtisan; // Alias for consistency
export const getArtisanProducts = artisansAPI.getArtisanProducts;
export const getSkills = artisansAPI.getSkills;
export const contactArtisan = artisansAPI.contactArtisan;
export const checkArtisanStatus = artisansAPI.checkArtisanStatus;
export const registerArtisan = artisansAPI.registerArtisan;
export const getArtisanDashboard = artisansAPI.getArtisanDashboard;
export const getArtisanProfile = artisansAPI.getArtisanProfile;