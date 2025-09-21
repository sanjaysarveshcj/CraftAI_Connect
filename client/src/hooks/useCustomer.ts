import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '@/services';
import { toast } from 'sonner';

// Cart hooks
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => customerAPI.getCart(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity, customization }: { productId: string; quantity?: number; customization?: any }) =>
      customerAPI.addToCart(productId, quantity, customization),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      customerAPI.updateCartItem(productId, quantity),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => customerAPI.removeFromCart(productId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove from cart';
      toast.error(message);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => customerAPI.clearCart(),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    },
  });
};

// Wishlist hooks
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => customerAPI.getWishlist(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => customerAPI.addToWishlist(productId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => customerAPI.removeFromWishlist(productId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
    },
  });
};

// Orders hooks
export const useOrders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => customerAPI.getOrders(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => customerAPI.getOrder(orderId),
    enabled: !!orderId,
  });
};