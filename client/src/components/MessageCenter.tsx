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
  initialConversationId?: string | null;
}

export function MessageCenter({ isOpen, onClose, initialConversationId }: MessageCenterProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  
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

  // Handle initial conversation selection
  useEffect(() => {
    console.log('🟡 MessageCenter useEffect - isOpen:', isOpen, 'initialConversationId:', initialConversationId);
    if (isOpen && initialConversationId) {
      setSelectedConversation(initialConversationId);
    }
  }, [isOpen, initialConversationId]);

  // Auto-focus message input when conversation is selected
  useEffect(() => {
    if (selectedConversation && messageInputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  }, [selectedConversation]);

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
        page: pagination.current + 1
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
        <div className={`max-w-[75%] flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
          {/* Avatar for non-own messages */}
          {!isOwn && (
            <Avatar className="w-8 h-8 mb-1 flex-shrink-0">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gray-300 text-gray-600 text-xs font-medium">
                {message.sender.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            {/* Sender name for non-own messages */}
            {!isOwn && (
              <span className="text-xs text-gray-500 mb-1 ml-2 font-medium">
                {message.sender.name}
              </span>
            )}

            {/* Message bubble */}
            <div className={`px-4 py-3 rounded-2xl shadow-sm max-w-full ${
              isOwn 
                ? 'bg-blue-600 text-white rounded-br-md' 
                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
            }`}>
              {/* Message content based on type */}
              {message.messageType === 'order_request' && (
                <OrderRequestMessage message={message} onRespond={handleOrderResponse} isOwn={isOwn} />
              )}
              
              {message.messageType === 'order_response' && (
                <OrderResponseMessage message={message} />
              )}
              
              {message.messageType === 'text' && (
                <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {message.content}
                </div>
              )}

              {/* Timestamp */}
              <div className={`text-xs mt-2 ${
                isOwn ? 'text-blue-100' : 'text-gray-500'
              } ${isOwn ? 'text-right' : 'text-left'}`}>
                {formatDistance(new Date(message.createdAt), new Date(), { addSuffix: true })}
                {isOwn && (
                  <span className="ml-2 text-blue-200">
                    {message.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
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
          {/* Left Sidebar - Conversations List */}
          <div className="w-1/3 border-r bg-white">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="flex items-center text-lg font-semibold">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Messages
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(100%-88px)]">
              {loadingConversations ? (
                <div className="p-6 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-gray-600">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Contact artisans to start chatting
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {conversations.map((conv: Conversation) => {
                    // Determine the other participant's details
                    const isCustomerView = user?.role === 'customer';
                    const otherParticipant = isCustomerView 
                      ? {
                          name: conv.artisan?.businessInfo?.businessName || conv.artisan?.user?.name || 'Artisan',
                          avatar: null, // Will use fallback
                          rating: conv.artisan?.ratings?.average
                        }
                      : {
                          name: conv.customer?.name || 'Customer',
                          avatar: conv.customer?.profile?.avatar || null,
                          rating: null
                        };

                    return (
                      <div
                        key={conv._id}
                        className={`mx-3 mb-2 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                          selectedConversation === conv._id 
                            ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' 
                            : 'hover:shadow-sm'
                        }`}
                        onClick={() => setSelectedConversation(conv._id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                              <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm">
                                {otherParticipant.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conv.unreadCount && conv.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">
                                {otherParticipant.name}
                              </h4>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                {formatDistance(new Date(conv.lastActivity), new Date(), { addSuffix: true })}
                              </span>
                            </div>
                            
                            {otherParticipant.rating && (
                              <div className="flex items-center mb-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                <span className="text-xs text-gray-500">{otherParticipant.rating}</span>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mb-1 font-medium truncate">
                              {conv.subject}
                            </p>
                            
                            {conv.lastMessage && (
                              <p className="text-xs text-gray-400 truncate leading-relaxed">
                                {conv.lastMessage.content.length > 50 
                                  ? `${conv.lastMessage.content.substring(0, 50)}...`
                                  : conv.lastMessage.content
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Panel - Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {conversation && (
                        <>
                          <Avatar className="w-12 h-12 mr-4 ring-2 ring-white shadow-md">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                              {user?.role === 'customer' 
                                ? (conversation.artisan?.businessInfo?.businessName?.[0] || conversation.artisan?.user?.name?.[0] || 'A')
                                : (conversation.customer?.name?.[0] || 'C')
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {user?.role === 'customer' 
                                ? (conversation.artisan?.businessInfo?.businessName || conversation.artisan?.user?.name || 'Artisan')
                                : (conversation.customer?.name || 'Customer')
                              }
                            </h3>
                            {user?.role === 'customer' && conversation.artisan?.ratings && (
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{conversation.artisan.ratings.average}</span>
                                <span className="text-gray-400 ml-1">({conversation.artisan.ratings.count} reviews)</span>
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
                          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Order Product
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => archiveConversationMutation.mutate(selectedConversation)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area with Dynamic Input */}
                <div className="flex-1 overflow-hidden bg-gray-50">
                  <ScrollArea className="h-full px-6 py-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm text-gray-600">Loading messages...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Load More Button */}
                        {pagination && pagination.current < pagination.total && (
                          <div className="text-center mb-6">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleLoadMoreMessages}
                              disabled={loadMoreMessagesMutation.isPending}
                              className="text-gray-600 border-gray-300 hover:bg-gray-50"
                            >
                              {loadMoreMessagesMutation.isPending ? (
                                <>
                                  <div className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                                  Loading...
                                </>
                              ) : (
                                'Load Earlier Messages'
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {messages.length === 0 ? (
                          <div className="flex items-center justify-center h-full min-h-[300px]">
                            <div className="text-center text-gray-500 py-8">
                              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <h4 className="font-medium text-lg mb-2">No messages yet</h4>
                              <p className="text-sm text-gray-400">Start the conversation by typing a message below</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 mb-4">
                            {messages.map(renderMessage)}
                          </div>
                        )}

                        {/* Message Input - Dynamic Position After Last Message */}
                        <div className="mt-4 mb-6">
                          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <Input
                                  ref={messageInputRef}
                                  placeholder="Type your message..."
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendMessage();
                                    }
                                  }}
                                  className="w-full h-[48px] px-4 py-3 text-sm border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                                  disabled={sendMessageMutation.isPending}
                                />
                              </div>
                              <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                                className="h-[48px] w-[48px] rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
                                size="sm"
                              >
                                {sendMessageMutation.isPending ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 px-1">
                              Press Enter to send • Shift+Enter for new line
                            </p>
                          </div>
                        </div>

                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </ScrollArea>
                </div>

              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500 py-12">
                  <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Select a conversation</h3>
                  <p className="text-sm text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MessageCenter;