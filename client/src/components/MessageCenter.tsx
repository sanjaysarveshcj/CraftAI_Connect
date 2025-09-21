import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShoppingCart,
  Star,
  Archive,
  Image as ImageIcon
} from 'lucide-react';
import { 
  useConversations, 
  useConversation, 
  useStartConversation, 
  useSendMessage, 
  useSendOrderRequest,
  useRespondToOrder,
  useArchiveConversation,
  useLoadMoreMessages
} from '@/hooks/useMessages';
import { Conversation, Message, OrderRequestData } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistance } from 'date-fns';

interface MessageCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessageCenter({ isOpen, onClose }: MessageCenterProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current user from auth context
  const { user } = useAuth();

  // API hooks
  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const { data: conversationData, isLoading: loadingMessages } = useConversation(selectedConversation || '');
  const sendMessageMutation = useSendMessage();
  const sendOrderRequestMutation = useSendOrderRequest();
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

  const handleSendOrderRequest = async (orderData: OrderRequestData) => {
    if (!selectedConversation) return;

    try {
      await sendOrderRequestMutation.mutateAsync({
        conversationId: selectedConversation,
        data: orderData
      });
      setShowOrderDialog(false);
    } catch (error) {
      console.error('Failed to send order request:', error);
    }
  };

  const handleOrderResponse = async (messageId: string, accepted: boolean, responseMessage?: string, finalPrice?: number) => {
    if (!selectedConversation) return;

    try {
      await respondToOrderMutation.mutateAsync({
        conversationId: selectedConversation,
        data: {
          messageId,
          accepted,
          responseMessage,
          finalPrice
        }
      });
    } catch (error) {
      console.error('Failed to respond to order:', error);
    }
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
    // Check if the message is from the current user
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
            <OrderRequestMessage message={message} onRespond={handleOrderResponse} isOwn={isOwn} />
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

  const OrderRequestMessage = ({ message, onRespond, isOwn }: { message: Message; onRespond: (messageId: string, accepted: boolean, responseMessage?: string, finalPrice?: number) => void; isOwn?: boolean }) => {
    const [responseText, setResponseText] = useState('');
    const [finalPrice, setFinalPrice] = useState<number>(message.metadata?.orderDetails?.estimatedPrice?.min || 0);

    // Check if current user is the artisan (can respond to order requests)
    const canRespond = user?.role === 'artisan' && !isOwn;

    return (
      <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
        <div className="flex items-center mb-2">
          <Package className="w-4 h-4 mr-2 text-amber-600" />
          <span className="font-medium text-amber-800">Order Request</span>
        </div>
        
        <p className="text-sm mb-2">{message.content}</p>
        
        {message.metadata?.orderDetails && (
          <div className="text-xs text-gray-600 mb-3">
            <p>Quantity: {message.metadata.orderDetails.quantity}</p>
            <p>Estimated Price: ${message.metadata.orderDetails.estimatedPrice?.min} - ${message.metadata.orderDetails.estimatedPrice?.max}</p>
            {message.metadata.orderDetails.timeline && <p>Timeline: {message.metadata.orderDetails.timeline}</p>}
          </div>
        )}

        {/* Response actions (shown to artisan for incoming requests) */}
        {canRespond && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={2}
            />
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Final price"
                value={finalPrice}
                onChange={(e) => setFinalPrice(Number(e.target.value))}
                className="w-24"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespond(message._id, false, responseText)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => onRespond(message._id, true, responseText, finalPrice)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>
            </div>
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
            <p>Final Price: ${message.metadata.finalPrice}</p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Messages
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(100%-80px)]">
              {loadingConversations ? (
                <div className="p-4">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Contact artisans to start chatting
                  </p>
                </div>
              ) : (
                conversations.map((conv: Conversation) => {
                  // Determine the other participant's name based on current user's role
                  const otherParticipantName = user?.role === 'customer' 
                    ? conv.artisan?.businessInfo?.businessName || 'Artisan'
                    : conv.customer?.name || 'Customer';
                  
                  const otherParticipantAvatar = user?.role === 'customer' 
                    ? conv.artisan?.businessInfo?.businessName?.[0] || 'A'
                    : conv.customer?.name?.[0] || 'C';

                  return (
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
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                              {otherParticipantAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate text-gray-900">
                              {otherParticipantName}
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
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {conversation && (
                        <>
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {user?.role === 'customer' 
                                ? conversation.artisan?.businessInfo?.businessName?.[0] || 'A'
                                : conversation.customer?.name?.[0] || 'C'
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">
                              {user?.role === 'customer' 
                                ? conversation.artisan?.businessInfo?.businessName || 'Artisan'
                                : conversation.customer?.name || 'Customer'
                              }
                            </h3>
                            {user?.role === 'customer' && conversation.artisan?.ratings && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {conversation.artisan.ratings.average} ({conversation.artisan.ratings.count} reviews)
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {user?.role === 'customer' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowOrderDialog(true)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Order Product
                        </Button>
                      )}
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
                          <div className="mb-2">No messages yet. Start the conversation!</div>
                          <div className="text-xs text-gray-400">
                            Debug: Conversation ID: {selectedConversation}
                          </div>
                          <div className="text-xs text-gray-400">
                            Debug: Loading: {loadingMessages ? 'Yes' : 'No'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Debug: Messages array length: {messages.length}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs text-gray-400 mb-2">
                            Debug: Showing {messages.length} messages
                          </div>
                          {messages.map(renderMessage)}
                        </>
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
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MessageCenter;