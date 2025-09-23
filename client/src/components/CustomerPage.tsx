import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, Bot, User, MapPin, Star, MessageCircle, Lock, Heart, ShoppingCart, Search, Filter, Loader2, Sparkles, Eye, Maximize2, X 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, useProductCategories } from "@/hooks/useProducts";
import { useArtisans } from "@/hooks/useArtisans";
import { useAIChat } from "@/hooks/useAI";
import { useAddToCart, useAddToWishlist } from "@/hooks/useCart";
import { useStartConversation } from "@/hooks/useMessages";
import { Product, Artisan } from "@/services";
import { DesignGenerationModal } from './DesignGenerationModal';
import { DesignResults } from './DesignResults';
import { MessageCenter } from './MessageCenter';
import { ArtisanProfile } from './ArtisanProfile';
import { RoleGuard } from './RoleGuard';
import { CustomerArtisansList } from './CustomerArtisansList';
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = {
  id: number;
  type: "bot" | "user";
  message: string;
  sessionId?: string;
};

export function CustomerPage() {
  return (
    <RoleGuard allowedRoles={['customer']}>
      <CustomerPageContent />
    </RoleGuard>
  );
}

function CustomerPageContent() {
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [designResult, setDesignResult] = useState<any>(null);
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false);
  const [selectedArtisanId, setSelectedArtisanId] = useState<string | null>(null);
  const [isArtisanProfileOpen, setIsArtisanProfileOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // 👈 New state for expanded chat
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot" as const,
      message: "Hello! I'm your AI craft assistant. Describe the custom product you'd like to have made, and I'll help you visualize it and connect you with the perfect artisan.",
    },
  ]);

  // API hooks
  const { data: categoriesData } = useProductCategories();
  const { data: productsData, isLoading: productsLoading } = useProducts({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    limit: 12
  });
  const { data: artisansData, isLoading: artisansLoading } = useArtisans({ limit: 10 });
  
  // Mutations
  const aiChatMutation = useAIChat();
  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();
  const startConversationMutation = useStartConversation();

  const categories = categoriesData?.data?.categories || [];
  const allCategories = ["All", ...categories];
  const products = productsData?.data?.products || [];
  const artisans = artisansData?.data?.artisans || [];

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to use AI chat");
      return;
    }

    const newUserMessage = {
      id: chatHistory.length + 1,
      type: "user" as const,
      message: message,
      sessionId: currentSessionId,
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    const currentMessage = message;
    setMessage("");

    try {
      const response = await aiChatMutation.mutateAsync({
        message: currentMessage,
        sessionId: currentSessionId || undefined
      });

      if (response.success) {
        // Update session ID if this is the first message
        if (!currentSessionId) {
          setCurrentSessionId(response.data.sessionId);
        }

        const aiResponse = {
          id: chatHistory.length + 2,
          type: "bot" as const,
          message: response.data.message,
          sessionId: response.data.sessionId,
        };
        setChatHistory(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const handleArtisanClick = async (artisan: Artisan) => {
    if (!isAuthenticated) {
      toast("Please sign in to contact artisans", {
        description: "You need to be logged in to chat with artisans",
        action: {
          label: "Sign In",
          onClick: () => toast("Please use the login button in the navigation"),
        },
      });
      return;
    }

    try {
      const response = await startConversationMutation.mutateAsync({
        artisanId: artisan._id,
        subject: `Inquiry about ${artisan.skills.primaryCraft}`,
        initialMessage: `Hello ${artisan.user.name}, I'm interested in your ${artisan.skills.primaryCraft}.`
      });

      if (response.success) {
        toast.success(`Started conversation with ${artisan.user.name}`);
        setIsMessageCenterOpen(true);
      }
    } catch (error) {
      toast.error("Failed to start conversation");
      console.error('Start conversation error:', error);
    }
  };

  const handleViewArtisanProfile = (artisan: Artisan) => {
    setSelectedArtisanId(artisan._id);
    setIsArtisanProfileOpen(true);
  };

  const handleArtisanProfileContact = (artisan: Artisan, conversationId?: string) => {
    console.log('🔵 handleArtisanProfileContact called:', conversationId);
    setIsArtisanProfileOpen(false);
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
    setIsMessageCenterOpen(true);
    console.log('🔵 Set isMessageCenterOpen to true');
  };

  const handleProductClick = (product: Product) => {
    toast("Product Details", {
      description: `${product.name} by ${product.artisan.user.name} - $${product.pricing.basePrice}`,
    });
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    
    addToCartMutation.mutate({ productId: product._id });
  };

  const handleAddToWishlist = (product: Product) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }
    
    addToWishlistMutation.mutate(product._id);
  };

  const handleDesignGenerated = (result: any) => {
    setDesignResult(result);
    setIsDesignModalOpen(false);
    toast.success("Design generated successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Artisan Marketplace</h1>
            <p className="text-primary-foreground/90">Discover unique handcrafted items from local artisans</p>
            {isAuthenticated && (
              <p className="text-sm text-primary-foreground/75 mt-2">
                Welcome back, {user?.name}!
              </p>
            )}
          </div>
          
          {isAuthenticated && (
            <Button
              variant="secondary"
              onClick={() => setIsMessageCenterOpen(true)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Messages
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border-b p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for crafts, artisans, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {allCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Product Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </h2>
              <p className="text-muted-foreground">
                {productsLoading ? "Loading..." : `${products.length} items found`}
              </p>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card 
                    key={product._id} 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative">
                      <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={product.images && product.images.length > 0 ? product.images[0].url : "/placeholder.svg"} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-3 right-3 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWishlist(product);
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                          <p className="text-xl font-bold text-primary">${product.pricing.basePrice}</p>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          by {product.artisan.user.name}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm ml-1">{product.ratings.average}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({product.ratings.count} reviews)
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 pt-2">
                          {product.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            className="flex-1 bg-gradient-primary" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={addToCartMutation.isPending}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedArtisanId(product.artisan._id);
                              setIsArtisanProfileOpen(true);
                            }}
                            className="px-3"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar with Tabs */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <Tabs defaultValue="ai-chat" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai-chat" className="flex items-center gap-1">
                    <Bot className="h-4 w-4" />
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger value="design" className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Design
                  </TabsTrigger>
                  <TabsTrigger value="artisans" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Artisans
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-chat" className="p-0 mt-0">
                  <div className="h-96 flex flex-col border rounded-lg bg-card">
                    {/* Chat Header */}
                    <div className="p-4 border-b relative bg-card rounded-t-lg">
                      <h3 className="font-semibold flex items-center">
                        <Bot className="h-4 w-4 mr-2 text-primary" />
                        AI Assistant
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Powered by Gemini
                        </span>
                        {!isAuthenticated && (
                          <Lock className="h-4 w-4 ml-2 text-muted-foreground" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isAuthenticated 
                          ? "Get intelligent craft recommendations from Google's AI" 
                          : "Sign in to use AI chat"}
                      </p>

                      {/* 👇 Expand Button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsExpanded(true)}
                        className="h-8 w-8 absolute right-4 top-1"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {!isAuthenticated && (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Please sign in to use the AI chat assistant
                          </p>
                        </div>
                      </div>
                    )}

                    {isAuthenticated && (
                      <>
                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[280px]">
                          {chatHistory.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${
                                msg.type === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div className="flex items-start space-x-2 max-w-[85%]">
                                {msg.type === "bot" && (
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <div className="bg-primary rounded-full flex items-center justify-center h-full">
                                      <Bot className="h-3 w-3 text-white" />
                                    </div>
                                  </Avatar>
                                )}
                                <div
                                  className={`p-2 rounded-lg text-sm break-words ${
                                    msg.type === "user"
                                      ? "bg-primary text-white rounded-br-none"
                                      : "bg-muted rounded-bl-none"
                                  }`}
                                >
                                  <p className="leading-relaxed">{msg.message}</p>
                                </div>
                                {msg.type === "user" && (
                                  <Avatar className="h-6 w-6 flex-shrink-0">
                                    <div className="bg-accent rounded-full flex items-center justify-center h-full">
                                      <User className="h-3 w-3 text-white" />
                                    </div>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          ))}
                          {aiChatMutation.isPending && (
                            <div className="flex justify-start">
                              <div className="flex items-start space-x-2 max-w-[85%]">
                                <Avatar className="h-6 w-6 flex-shrink-0">
                                  <div className="bg-primary rounded-full flex items-center justify-center h-full">
                                    <Bot className="h-3 w-3 text-white" />
                                  </div>
                                </Avatar>
                                <div className="p-2 rounded-lg text-sm bg-muted rounded-bl-none">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Thinking...</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t bg-card">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Ask about custom crafts..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                              className="flex-1 text-sm border-muted-foreground/20 focus:border-primary"
                              disabled={aiChatMutation.isPending}
                            />
                            <Button 
                              onClick={handleSendMessage} 
                              size="sm"
                              disabled={!message.trim() || aiChatMutation.isPending}
                              className="px-3"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="design" className="p-0 mt-0">
                  <div className="h-96">
                    {/* Design Header */}
                    <div className="p-4 border-b">
                      <h3 className="font-semibold flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-primary" />
                        AI Design Generator
                      </h3>
                      <p className="text-sm text-muted-foreground">Create custom designs with AI</p>
                    </div>

                    {/* Design Content */}
                    <div className="p-4 space-y-4 overflow-y-auto h-full">
                      {designResult ? (
                        <DesignResults
                          result={designResult}
                          onContactArtisan={(artisanId) => {
                            if (!isAuthenticated) {
                              toast.error("Please login to contact artisans");
                              return;
                            }
                            // Find artisan and start conversation
                            const artisan = artisans.find(a => a._id === artisanId);
                            if (artisan) {
                              handleArtisanClick(artisan);
                            }
                          }}
                          onStartChat={() => {
                            // Switch to chat tab
                            const chatTab = document.querySelector('[value="ai-chat"]') as HTMLElement;
                            chatTab?.click();
                          }}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center py-8">
                            <Sparkles className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                            <h4 className="font-medium mb-2">Generate Your Dream Design</h4>
                            <p className="text-sm text-muted-foreground mb-6">
                              Describe your vision and let AI help you create the perfect custom craft
                            </p>
                            <Button 
                              onClick={() => setIsDesignModalOpen(true)}
                              className="w-full"
                              disabled={!isAuthenticated}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Start Design Generation
                              {!isAuthenticated && <Lock className="h-4 w-4 ml-2" />}
                            </Button>
                            {!isAuthenticated && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Login required to generate designs
                              </p>
                            )}
                          </div>
                          
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h5 className="font-medium text-sm mb-2">✨ How it works:</h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>• Describe your ideal custom product in detail</li>
                              <li>• AI generates a design concept and suggestions</li>
                              <li>• Get matched with artisans who can create it</li>
                              <li>• Chat directly with recommended craftspeople</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="artisans" className="p-0 mt-0">
                  <div className="h-[calc(100vh-12rem)]">
                    <CustomerArtisansList />
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      
      {/* 👇 Fullscreen Chat Modal with Zoom Animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              layout
              className="relative w-full max-w-4xl h-[80vh] bg-card border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* The main Card component that contains everything */}
              <Card className="h-full border-0 rounded-2xl">
                <Tabs defaultValue="ai-chat" className="w-full h-full flex flex-col">
                  {/* TabsList section is styled as a header within the card */}
                  <div className="bg-muted px-8 py-6 border-b border-muted-200">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="ai-chat" className="flex items-center gap-1">
                        <Bot className="h-4 w-4" />
                        AI Chat
                      </TabsTrigger>
                      <TabsTrigger value="design" className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        Design
                      </TabsTrigger>
                      <TabsTrigger value="artisans" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Artisans
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* AI Chat Tab Content - The main chat area */}
                  <TabsContent value="ai-chat" className="h-full flex-1 flex flex-col p-0 mt-0">
                    <div className="flex-1 flex flex-col justify-end overflow-hidden">
                      {!isAuthenticated && (
                        <div className="flex-1 flex items-center justify-center p-6">
                          <div className="text-center">
                            <Lock className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                            <p className="text-muted-foreground text-lg">
                              Please sign in to use the AI chat assistant
                            </p>
                          </div>
                        </div>
                      )}
                      {isAuthenticated && (
                        <>
                          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/50">
                            {chatHistory.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.type === "user" ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div className="flex items-start space-x-3 max-w-[75%]">
                                  {msg.type === "bot" && (
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                      <div className="bg-primary rounded-full flex items-center justify-center h-full">
                                        <Bot className="h-4 w-4 text-white" />
                                      </div>
                                    </Avatar>
                                  )}
                                  <div
                                    className={`p-4 rounded-xl shadow-sm break-words ${
                                      msg.type === "user"
                                        ? "bg-primary text-white rounded-br-md"
                                        : "bg-white border rounded-bl-md"
                                    }`}
                                  >
                                    <p className="leading-relaxed">{msg.message}</p>
                                  </div>
                                  {msg.type === "user" && (
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                      <div className="bg-accent rounded-full flex items-center justify-center h-full">
                                        <User className="h-4 w-4 text-white" />
                                      </div>
                                    </Avatar>
                                  )}
                                </div>
                              </div>
                            ))}
                            {aiChatMutation.isPending && (
                              <div className="flex justify-start">
                                <div className="flex items-start space-x-3 max-w-[75%]">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <div className="bg-primary rounded-full flex items-center justify-center h-full">
                                      <Bot className="h-4 w-4 text-white" />
                                    </div>
                                  </Avatar>
                                  <div className="p-4 rounded-xl bg-white border rounded-bl-md shadow-sm">
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Thinking...</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-6 border-t bg-card">
                            <div className="flex space-x-3 max-w-4xl mx-auto">
                              <Input
                                placeholder="Ask about custom crafts..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                className="flex-1 border-muted-foreground/20 focus:border-primary"
                                disabled={aiChatMutation.isPending}
                              />
                              <Button 
                                onClick={handleSendMessage} 
                                disabled={!message.trim() || aiChatMutation.isPending}
                                className="px-6"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  {/* Design Tab Content - The rest of the tabs can use this same pattern */}
                  <TabsContent value="design" className="p-0 mt-0 flex-1">
                    <div className="h-full flex flex-col">
                      <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-primary" />
                          AI Design Generator
                        </h3>
                        <p className="text-muted-foreground mt-1">Create custom designs with AI</p>
                      </div>
                      <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        {designResult ? (
                          <DesignResults
                            result={designResult}
                            onContactArtisan={(artisanId) => {
                              if (!isAuthenticated) {
                                toast.error("Please login to contact artisans");
                                return;
                              }
                              const artisan = artisans.find(a => a._id === artisanId);
                              if (artisan) {
                                handleArtisanClick(artisan);
                              }
                            }}
                            onStartChat={() => {
                              const chatTab = document.querySelector('[value="ai-chat"]') as HTMLElement;
                              chatTab?.click();
                            }}
                          />
                        ) : (
                          <div className="space-y-6">
                            <div className="text-center py-12">
                              <Sparkles className="h-16 w-16 text-primary/20 mx-auto mb-6" />
                              <h4 className="text-xl font-medium mb-3">Generate Your Dream Design</h4>
                              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                Describe your vision and let AI help you create the perfect custom craft
                              </p>
                              <Button 
                                onClick={() => setIsDesignModalOpen(true)}
                                size="lg"
                                disabled={!isAuthenticated}
                              >
                                <Sparkles className="h-5 w-5 mr-2" />
                                Start Design Generation
                                {!isAuthenticated && <Lock className="h-5 w-5 ml-2" />}
                              </Button>
                              {!isAuthenticated && (
                                <p className="text-sm text-muted-foreground mt-3">
                                  Login required to generate designs
                                </p>
                              )}
                            </div>
                            <div className="bg-muted/30 rounded-lg p-6 max-w-md mx-auto">
                              <h5 className="font-medium mb-3">✨ How it works:</h5>
                              <ul className="text-sm text-muted-foreground space-y-2">
                                <li>• Describe your ideal custom product in detail</li>
                                <li>• AI generates a design concept and suggestions</li>
                                <li>• Get matched with artisans who can create it</li>
                                <li>• Chat directly with recommended craftspeople</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Artisans Tab Content */}
                  <TabsContent value="artisans" className="p-0 mt-0 flex-1">
                    <div className="h-full px-6 py-4">
                      <CustomerArtisansList />
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Design Generation Modal */}
      <DesignGenerationModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        onDesignGenerated={handleDesignGenerated}
      />

      {/* Message Center */}
      <MessageCenter
        isOpen={isMessageCenterOpen}
        onClose={() => {
          setIsMessageCenterOpen(false);
          setSelectedConversationId(null);
        }}
        initialConversationId={selectedConversationId}
      />

      {/* Artisan Profile Modal */}
      {selectedArtisanId && (
        <ArtisanProfile
          artisanId={selectedArtisanId}
          isOpen={isArtisanProfileOpen}
          onClose={() => {
            setIsArtisanProfileOpen(false);
            setSelectedArtisanId(null);
          }}
          onContactArtisan={handleArtisanProfileContact}
        />
      )}
    </div>
  );
}