import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI, StartConversationRequest, SendMessageRequest, OrderRequestData, OrderResponseData } from '@/services';
import { toast } from 'sonner';

// Get user's conversations
export const useConversations = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: async () => {
      try {
        const result = await messagesAPI.getConversations(params);
        return result;
      } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get conversation details with messages
export const useConversation = (conversationId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['conversation', conversationId, params],
    queryFn: async () => {
      if (!conversationId) {
        return null;
      }
      
      try {
        const result = await messagesAPI.getConversation(conversationId, params);
        return result;
      } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
      }
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Start new conversation with artisan
export const useStartConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: StartConversationRequest) => {
      try {
        const result = await messagesAPI.startConversation(data);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (response) => {
      toast.success('Conversation started successfully');
      
      // Invalidate conversations list to include new conversation
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to start conversation';
      toast.error(message);
    }
  });
};

// Send message in conversation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: SendMessageRequest }) => {
      try {
        const result = await messagesAPI.sendMessage(conversationId, data);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (response, variables) => {
      const { conversationId } = variables;
      
      // Update the conversation cache with the new message
      const updated = queryClient.setQueryData(['conversation', conversationId], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        const newMessage = response.data.message;
        const updatedData = {
          ...oldData,
          data: {
            ...oldData.data,
            messages: [...(oldData.data.messages || []), newMessage]
          }
        };
        return updatedData;
      });

      // Also invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.refetchQueries({ queryKey: ['conversation', conversationId] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send message';
      toast.error(message);
    }
  });
};

// Send order request through conversation
export const useSendOrderRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: OrderRequestData }) => {
      const result = await messagesAPI.sendOrderRequest(conversationId, data);
      return result;
    },
    onSuccess: (response, variables) => {
      toast.success('Order request sent successfully');
      
      // Update conversation cache
      const { conversationId } = variables;
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send order request';
      toast.error(message);
    }
  });
};

// Respond to order request (artisan only)
export const useRespondToOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: string; data: OrderResponseData }) => {
      const result = await messagesAPI.respondToOrder(conversationId, data);
      return result;
    },
    onSuccess: (response, variables) => {
      const accepted = variables.data.accepted;
      toast.success(`Order ${accepted ? 'accepted' : 'declined'} successfully`);
      
      // Update conversation cache
      const { conversationId } = variables;
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to respond to order';
      toast.error(message);
    }
  });
};

// Archive conversation
export const useArchiveConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const result = await messagesAPI.archiveConversation(conversationId);
      return result;
    },
    onSuccess: () => {
      toast.success('Conversation archived successfully');
      
      // Refresh conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to archive conversation';
      toast.error(message);
    }
  });
};

// Load more messages (pagination)
export const useLoadMoreMessages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, page }: { conversationId: string; page: number }) => {
      const result = await messagesAPI.getConversation(conversationId, { page });
      return result;
    },
    onSuccess: (response, variables) => {
      const { conversationId } = variables;
      
      // Update cache with new messages (prepend to existing)
      queryClient.setQueryData(['conversation', conversationId], (oldData: any) => {
        if (!oldData || !response.data.messages) return oldData;
        
        const existingMessages = oldData.data.messages || [];
        const newMessages = response.data.messages;
        
        // Avoid duplicates by filtering out messages that already exist
        const existingIds = new Set(existingMessages.map((msg: any) => msg._id));
        const uniqueNewMessages = newMessages.filter((msg: any) => !existingIds.has(msg._id));
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: [...uniqueNewMessages, ...existingMessages],
            pagination: response.data.pagination
          }
        };
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to load more messages';
      toast.error(message);
    }
  });
};

// Get unread message count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const result = await messagesAPI.getUnreadCount();
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};