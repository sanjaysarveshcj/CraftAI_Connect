import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Archive,
  DollarSign,
  User
} from 'lucide-react';
import { 
  useConversations, 
  useConversation, 
  useSendMessage, 
  useRespondToOrder,
  useArchiveConversation,
  useLoadMoreMessages
} from '@/hooks/useMessages';
import { Conversation, Message } from '@/services';
import { formatDistance } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export function ArtisanMessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [orderResponses, setOrderResponses] = useState<Record<string, { message: string; price: number }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const { data: conversationData, isLoading: loadingMessages } = useConversation(selectedConversation || '');
  const sendMessageMutation = useSendMessage();
  const respondToOrderMutation = useRespondToOrder();
  const archiveConversationMutation = useArchiveConversation();
  const loadMoreMessagesMutation = useLoadMoreMessages();

  const conversations = conversationsData?.data?.conversations || [];
  const messages = conversationData?.data?.messages || [];
  const conversation = conversationData?.data?.conversation;
  const pagination = conversationData?.data?.pagination;

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        data: {
          content: newMessage,
          messageType: 'text'
        }
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleOrderResponse = async (messageId: string, accepted: boolean) => {
    if (!selectedConversation) return;

    const responseData = orderResponses[messageId];
    if (!responseData && accepted) return;

    try {
      await respondToOrderMutation.mutateAsync({
        conversationId: selectedConversation,
        data: {
          messageId,
          accepted,
          responseMessage: responseData?.message || (accepted ? 'Order accepted!' : 'Order declined.'),
          finalPrice: accepted ? responseData?.price : undefined
        }
      });

      // Clear the response data
      setOrderResponses(prev => {
        const newState = { ...prev };
        delete newState[messageId];
        return newState;
      });
    } catch (error) {
      console.error('Failed to respond to order:', error);
    }
  };

  const updateOrderResponse = (messageId: string, field: 'message' | 'price', value: string | number) => {
    setOrderResponses(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        message: prev[messageId]?.message || '',
        price: prev[messageId]?.price || 0,
        [field]: value
      }
    }));
  };

  const handleLoadMoreMessages = async () => {
    if (!selectedConversation || !pagination || pagination.current >= pagination.total) return;

    try {
      await loadMoreMessagesMutation.mutateAsync({
        conversationId: selectedConversation,
        page: pagination.current + 1,
        limit: 50
      });
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.sender._id === user?._id;
    
    return (
      <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] ${
          isOwn 
            ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg rounded-br-sm' 
            : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg rounded-bl-sm'
        } p-3 shadow-sm`}>
          {/* Sender info for non-own messages */}
          {!isOwn && (
            <div className="flex items-center mb-2">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-xs">{message.sender.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{message.sender.name}</span>
            </div>
          )}

          {/* Message content based on type */}
          {message.messageType === 'order_request' && (
            <OrderRequestMessage 
              message={message} 
              isOwn={isOwn}
              onRespond={handleOrderResponse}
              responseData={orderResponses[message._id]}
              onUpdateResponse={updateOrderResponse}
            />
          )}
          
          {message.messageType === 'order_response' && (
            <OrderResponseMessage message={message} />
          )}
          
          {message.messageType === 'text' && (
            <div className="text-sm leading-relaxed">{message.content}</div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'} text-right`}>
            {formatDistance(new Date(message.createdAt), new Date(), { addSuffix: true })}
            {isOwn && (
              <span className="ml-2">
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const OrderRequestMessage = ({ 
    message, 
    isOwn, 
    onRespond, 
    responseData, 
    onUpdateResponse 
  }: { 
    message: Message; 
    isOwn: boolean;
    onRespond: (messageId: string, accepted: boolean) => void;
    responseData?: { message: string; price: number };
    onUpdateResponse: (messageId: string, field: 'message' | 'price', value: string | number) => void;
  }) => {
    const hasResponded = message.metadata?.accepted !== undefined;

    return (
      <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
        <div className="flex items-center mb-2">
          <Package className="w-4 h-4 mr-2 text-amber-600" />
          <span className="font-medium text-amber-800">Order Request</span>
          {hasResponded && (
            <Badge 
              variant={message.metadata?.accepted ? 'default' : 'destructive'}
              className="ml-2"
            >
              {message.metadata?.accepted ? 'accepted' : 'declined'}
            </Badge>
          )}
        </div>
        
        <p className="text-sm mb-2">{message.content}</p>
        
        {message.metadata?.orderDetails && (
          <div className="text-xs text-gray-600 mb-3">
            <p><strong>Quantity:</strong> {message.metadata.orderDetails.quantity}</p>
            <p><strong>Budget:</strong> ${message.metadata.orderDetails.estimatedPrice?.min} - ${message.metadata.orderDetails.estimatedPrice?.max}</p>
            {message.metadata.orderDetails.timeline && (
              <p><strong>Timeline:</strong> {message.metadata.orderDetails.timeline}</p>
            )}
            {message.metadata.orderDetails.customization && (
              <p><strong>Details:</strong> {message.metadata.orderDetails.customization}</p>
            )}
          </div>
        )}

        {/* Response actions (shown to artisan for non-responded requests) */}
        {!isOwn && !hasResponded && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Your response to the customer..."
              value={responseData?.message || ''}
              onChange={(e) => onUpdateResponse(message._id, 'message', e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <Input
                  type="number"
                  placeholder="Final price"
                  value={responseData?.price || ''}
                  onChange={(e) => onUpdateResponse(message._id, 'price', parseFloat(e.target.value) || 0)}
                  className="w-24 h-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespond(message._id, false)}
                disabled={respondToOrderMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => onRespond(message._id, true)}
                disabled={!responseData?.message || !responseData?.price || respondToOrderMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>
            </div>
          </div>
        )}

        {/* Show response status if already responded */}
        {hasResponded && message.metadata?.finalPrice && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Final Price:</strong> ${message.metadata.finalPrice}</p>
          </div>
        )}
      </div>
    );
  };

  const OrderResponseMessage = ({ message }: { message: Message }) => {
    const accepted = message.metadata?.accepted;
    
    return (
      <div className={`border rounded-lg p-3 ${accepted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center mb-2">
          {accepted ? (
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 mr-2 text-red-600" />
          )}
          <span className={`font-medium ${accepted ? 'text-green-800' : 'text-red-800'}`}>
            Order {accepted ? 'Accepted' : 'Declined'}
          </span>
        </div>
        
        <p className="text-sm mb-2">{message.content}</p>
        
        {accepted && message.metadata?.finalPrice && (
          <div className="text-xs text-gray-600">
            <p><strong>Final Price:</strong> ${message.metadata.finalPrice}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Message Center</h1>
          <p className="text-primary-foreground/90">Manage customer conversations and orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Conversations
              </h3>
              <p className="text-sm text-muted-foreground">
                {loadingConversations ? "Loading..." : `${conversations.length} conversations`}
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100%-80px)]">
              {loadingConversations ? (
                <div className="p-4">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv: Conversation) => (
                  <div
                    key={conv._id}
                    className={`p-4 border-b cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                      selectedConversation === conv._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <Avatar className="w-12 h-12 mr-3 flex-shrink-0">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                            {conv.customer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate text-gray-900">
                            {conv.customer.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">{conv.subject}</p>
                          {conv.lastMessage && (
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs text-gray-400 mb-1">
                          {formatDistance(new Date(conv.lastActivity), new Date(), { addSuffix: true })}
                        </p>
                        <div className="flex flex-col items-end space-y-1">
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            Chat
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-3 bg-card rounded-lg border flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{conversation?.customer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{conversation?.customer.name}</h3>
                        <p className="text-sm text-gray-500">{conversation?.subject}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => archiveConversationMutation.mutate(selectedConversation)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="text-center">Loading messages...</div>
                  ) : (
                    <>
                      {/* Load More Button */}
                      {pagination && pagination.current < pagination.total && (
                        <div className="text-center mb-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleLoadMoreMessages}
                            disabled={loadMoreMessagesMutation.isPending}
                          >
                            {loadMoreMessagesMutation.isPending ? 'Loading...' : 'Load Earlier Messages'}
                          </Button>
                        </div>
                      )}
                      
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          No messages yet. Wait for customers to contact you!
                        </div>
                      ) : (
                        messages.map(renderMessage)
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtisanMessagesPage;