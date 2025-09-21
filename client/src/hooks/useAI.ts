import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiAPI, DesignGenerationRequest } from '@/services';
import { toast } from 'sonner';

// AI Chat hook
export const useAIChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      aiAPI.sendChatMessage(message, sessionId),
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
    },
  });
};

// Get chat history
export const useChatHistory = (sessionId: string) => {
  return useQuery({
    queryKey: ['chat-history', sessionId],
    queryFn: () => aiAPI.getChatHistory(sessionId),
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Generate AI design
export const useGenerateDesign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (designData: DesignGenerationRequest) =>
      aiAPI.generateDesign(designData),
    onSuccess: (data) => {
      toast.success(data.data.message);
      // Invalidate designs list to refetch
      queryClient.invalidateQueries({ queryKey: ['ai-designs'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate design';
      toast.error(message);
    },
  });
};

// Get user's AI designs
export const useAIDesigns = (page: number = 1, limit: number = 12) => {
  return useQuery({
    queryKey: ['ai-designs', page, limit],
    queryFn: () => aiAPI.getDesigns(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get AI recommendations
export const useAIRecommendations = (type: 'all' | 'products' | 'artisans' = 'all') => {
  return useQuery({
    queryKey: ['ai-recommendations', type],
    queryFn: () => aiAPI.getRecommendations(type),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};