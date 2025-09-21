import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerAPI } from '@/services';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Get user's cart
export const useCart = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => customerAPI.getCart(),
    staleTime: 30 * 1000, // 30 seconds
    enabled: isAuthenticated, // Only fetch when user is authenticated
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) =>
      customerAPI.addToCart(productId, quantity),
    onSuccess: () => {
      toast.success('Item added to cart!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
    },
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      customerAPI.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update cart item';
      toast.error(message);
    },
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => customerAPI.removeFromCart(itemId),
    onSuccess: () => {
      toast.success('Item removed from cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      toast.error(message);
    },
  });
};

// Clear entire cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => customerAPI.clearCart(),
    onSuccess: () => {
      toast.success('Cart cleared');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    },
  });
};

// Get user's wishlist
export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => customerAPI.getWishlist(),
    staleTime: 30 * 1000, // 30 seconds
    enabled: isAuthenticated, // Only fetch when user is authenticated
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Add item to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => customerAPI.addToWishlist(productId),
    onSuccess: () => {
      toast.success('Added to wishlist!');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
    },
  });
};

// Remove item from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => customerAPI.removeFromWishlist(productId),
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
    },
  });
};