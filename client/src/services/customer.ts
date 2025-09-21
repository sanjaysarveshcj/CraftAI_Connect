import api from './api';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    pricing: {
      basePrice: number;
      currency: string;
    };
    category: string;
    artisan: {
      _id: string;
      user: {
        name: string;
      };
    };
  };
  quantity: number;
  customization?: any;
  addedAt: string;
  itemTotal?: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    cart: CartItem[];
    totals: {
      subtotal: number;
      tax: number;
      shipping: number;
      total: number;
      currency: string;
    };
  };
}

export interface WishlistItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    pricing: {
      basePrice: number;
      currency: string;
    };
    category: string;
  };
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    wishlist: WishlistItem[];
  };
}

export const customerAPI = {
  // Cart operations
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/customer/cart');
    return response.data;
  },

  addToCart: async (productId: string, quantity: number = 1, customization?: any): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/customer/cart', { productId, quantity, customization });
    return response.data;
  },

  updateCartItem: async (productId: string, quantity: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/customer/cart/${productId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (productId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/customer/cart/${productId}`);
    return response.data;
  },

  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/customer/cart');
    return response.data;
  },

  // Wishlist operations
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get('/customer/wishlist');
    return response.data;
  },

  addToWishlist: async (productId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/customer/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/customer/wishlist/${productId}`);
    return response.data;
  },

  // Orders
  getOrders: async (page: number = 1, limit: number = 10): Promise<any> => {
    const response = await api.get(`/customer/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  getOrder: async (orderId: string): Promise<any> => {
    const response = await api.get(`/customer/orders/${orderId}`);
    return response.data;
  },

  // Profile
  getProfile: async (): Promise<any> => {
    const response = await api.get('/customer/profile');
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<any> => {
    const response = await api.put('/customer/profile', profileData);
    return response.data;
  }
};