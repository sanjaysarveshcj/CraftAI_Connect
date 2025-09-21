import api from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: { url: string; alt?: string; isPrimary?: boolean }[];
  pricing: {
    basePrice: number;
    currency: string;
    priceRange?: {
      min: number;
      max: number;
    };
  };
  artisan: {
    _id: string;
    user: {
      name: string;
    };
    businessInfo: {
      businessName: string;
    };
  };
  specifications: {
    materials: string[];
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit?: string;
    };
    colors: string[];
    weight?: number;
  };
  customization: {
    isCustomizable: boolean;
    options: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  };
  ratings: {
    average: number;
    count: number;
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalItems: number;
    };
  };
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  tags?: string[];
  artisan?: string;
  location?: string;
  customizable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const productsAPI = {
  // Get all products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get product categories
  getCategories: async (): Promise<{ success: boolean; data: { categories: string[] } }> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductsResponse> => {
    return productsAPI.getProducts({ ...filters, search: query });
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 6): Promise<ProductsResponse> => {
    const response = await api.get(`/products/featured?limit=${limit}`);
    return response.data;
  }
};