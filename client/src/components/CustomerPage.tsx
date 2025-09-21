import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, MapPin, Star, MessageCircle, Lock, Heart, ShoppingCart, Search, Filter, Loader2, Sparkles, Eye } from "lucide-react";
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

  const handleArtisanProfileContact = (artisan: Artisan) => {
    setIsArtisanProfileOpen(false);
    setIsMessageCenterOpen(true);
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
                          src={product.images[0] || "/placeholder.svg"} 
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
                  <div className="h-96 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b">
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
                          : "Sign in to use AI chat"
                        }
                      </p>
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
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                          {chatHistory.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex items-start space-x-2 ${
                                msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                {msg.type === "bot" ? (
                                  <div className="bg-primary rounded-full flex items-center justify-center h-full">
                                    <Bot className="h-3 w-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="bg-accent rounded-full flex items-center justify-center h-full">
                                    <User className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </Avatar>
                              <div
                                className={`flex-1 p-2 rounded-lg text-sm ${
                                  msg.type === "user"
                                    ? "bg-primary text-white"
                                    : "bg-muted"
                                }`}
                              >
                                <p>{msg.message}</p>
                              </div>
                            </div>
                          ))}
                          {aiChatMutation.isPending && (
                            <div className="flex items-start space-x-2">
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <div className="bg-primary rounded-full flex items-center justify-center h-full">
                                  <Bot className="h-3 w-3 text-white" />
                                </div>
                              </Avatar>
                              <div className="flex-1 p-2 rounded-lg text-sm bg-muted">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Thinking...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Ask about custom crafts..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                              className="flex-1 text-sm"
                              disabled={aiChatMutation.isPending}
                            />
                            <Button 
                              onClick={handleSendMessage} 
                              size="sm"
                              disabled={!message.trim() || aiChatMutation.isPending}
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
                  <div className="h-96">
                    {/* Artisans Header */}
                    <div className="p-4 border-b">
                      <h3 className="font-semibold flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        Nearby Artisans
                      </h3>
                      <p className="text-sm text-muted-foreground">Connect with local craftspeople</p>
                    </div>

                    {/* Artisans List */}
                    <div className="p-4 space-y-3 overflow-y-auto h-full">
                      {artisansLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="ml-2 text-sm">Loading artisans...</span>
                        </div>
                      ) : (
                        <>
                          {artisans.slice(0, 5).map((artisan) => (
                            <Card
                              key={artisan._id}
                              className="transition-all duration-200 hover:shadow-md"
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start space-x-3">
                                  <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={artisan.user.profile?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs">
                                      {artisan.user.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">
                                      {artisan.user.name}
                                    </h4>
                                    <p className="text-xs text-primary">
                                      {artisan.skills.primaryCraft}
                                    </p>
                                    <div className="flex items-center mt-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      <span className="text-xs ml-1">{artisan.ratings.average}</span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {artisan.location.city}, {artisan.location.state}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {artisan.skills.specialties.slice(0, 2).map((specialty) => (
                                        <Badge key={specialty} variant="outline" className="text-xs px-1 py-0">
                                          {specialty}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 h-7 text-xs"
                                    onClick={() => handleViewArtisanProfile(artisan)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Profile
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="flex-1 h-7 text-xs"
                                    onClick={() => handleArtisanClick(artisan)}
                                    disabled={startConversationMutation.isPending}
                                  >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {startConversationMutation.isPending ? "Starting..." : "Contact"}
                                    {!isAuthenticated && <Lock className="h-3 w-3 ml-1" />}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          
                          {artisans.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-sm text-muted-foreground">
                                No artisans found
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Design Generation Modal */}
      <DesignGenerationModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        onDesignGenerated={handleDesignGenerated}
      />

      {/* Message Center */}
      <MessageCenter
        isOpen={isMessageCenterOpen}
        onClose={() => setIsMessageCenterOpen(false)}
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