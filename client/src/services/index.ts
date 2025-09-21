// Re-export all API services for easy importing
export { authAPI } from './auth';
export { productsAPI } from './products';
export { artisansAPI } from './artisans';
export { aiAPI } from './ai';
export { customerAPI } from './customer';
export { messagesAPI } from './messages';

// Re-export types
export type { User, LoginData, RegisterData, AuthResponse } from './auth';
export type { Product, ProductsResponse, ProductFilters } from './products';
export type { Artisan, ArtisansResponse, ArtisanFilters } from './artisans';
export type { ChatMessage, ChatSession, ChatResponse, AIDesign, DesignGenerationRequest, AIRecommendations } from './ai';
export type { CartItem, CartResponse, WishlistItem, WishlistResponse } from './customer';
export type { 
  Message, 
  Conversation, 
  StartConversationRequest, 
  SendMessageRequest, 
  OrderRequestData, 
  OrderResponseData 
} from './messages';