import api from './api';

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    profile?: {
      avatar?: string;
    };
  };
  content: string;
  messageType: 'text' | 'image' | 'order_request' | 'order_response' | 'product_share' | 'design_share';
  attachments: string[];
  metadata?: {
    orderId?: string;
    productId?: string;
    designId?: string;
    orderDetails?: {
      quantity: number;
      customization: any;
      estimatedPrice: {
        min: number;
        max: number;
      };
      timeline: string;
      specifications: any;
    };
    accepted?: boolean;
    finalPrice?: number;
    estimatedDelivery?: string;
    terms?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    user: {
      _id: string;
      name: string;
      profile?: {
        avatar?: string;
      };
    };
    role: 'customer' | 'artisan';
    joinedAt: string;
    lastSeenAt: string;
  }>;
  artisan: {
    _id: string;
    businessInfo: {
      businessName: string;
      description: string;
    };
    user: {
      _id: string;
      name: string;
    };
    ratings: {
      average: number;
      count: number;
    };
  };
  customer: {
    _id: string;
    name: string;
    profile?: {
      avatar?: string;
    };
  };
  subject: string;
  status: 'active' | 'archived' | 'blocked';
  lastMessage?: Message;
  lastActivity: string;
  relatedProduct?: {
    _id: string;
    name: string;
    images: string[];
    pricing: {
      basePrice: number;
    };
  };
  relatedDesign?: {
    _id: string;
    prompt: string;
    generatedImage?: {
      url: string;
    };
  };
  orders: string[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StartConversationRequest {
  artisanId: string;
  subject?: string;
  initialMessage: string;
  relatedProductId?: string;
  relatedDesignId?: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'image' | 'order_request' | 'order_response' | 'product_share' | 'design_share';
  attachments?: string[];
  metadata?: any;
}

export interface OrderRequestData {
  productId: string;
  quantity?: number;
  customization?: any;
  specifications?: any;
  requestedPrice?: {
    min: number;
    max: number;
  };
  timeline?: string;
  message?: string;
}

export interface OrderResponseData {
  messageId: string;
  accepted: boolean;
  responseMessage?: string;
  finalPrice?: number;
  estimatedDelivery?: string;
  terms?: string;
}

export const messagesAPI = {
  // Get user's conversations
  getConversations: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/messages/conversations', { params });
    return response.data;
  },

  // Get conversation details with messages
  getConversation: async (conversationId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/messages/conversations/${conversationId}`, { params });
    return response.data;
  },

  // Start new conversation with artisan
  startConversation: async (data: StartConversationRequest) => {
    const response = await api.post('/messages/conversations', data);
    return response.data;
  },

  // Send message in conversation
  sendMessage: async (conversationId: string, data: SendMessageRequest) => {
    const response = await api.post(`/messages/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  // Send order request through conversation
  sendOrderRequest: async (conversationId: string, data: OrderRequestData) => {
    const response = await api.post(`/messages/conversations/${conversationId}/order-request`, data);
    return response.data;
  },

  // Artisan responds to order request
  respondToOrder: async (conversationId: string, data: OrderResponseData) => {
    const response = await api.post(`/messages/conversations/${conversationId}/order-response`, data);
    return response.data;
  },

  // Archive conversation
  archiveConversation: async (conversationId: string) => {
    const response = await api.put(`/messages/conversations/${conversationId}/archive`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  }
};