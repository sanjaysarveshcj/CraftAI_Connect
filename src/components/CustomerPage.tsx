import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, MapPin, Star, MessageCircle, Lock, Heart, ShoppingCart, Search, Filter } from "lucide-react";
import { toast } from "sonner";

type ChatMessage = {
  id: number;
  type: "bot" | "user";
  message: string;
};

export function CustomerPage() {
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot" as const,
      message: "Hello! I'm your AI craft assistant. Describe the custom product you'd like to have made, and I'll help you visualize it and connect you with the perfect artisan.",
    },
  ]);

  const mockProducts = [
    {
      id: 1,
      name: "Handcrafted Ceramic Vase",
      price: "$89",
      rating: 4.8,
      reviews: 24,
      image: "/placeholder.svg",
      category: "Ceramics",
      artisan: "Elena Rodriguez",
      tags: ["Handmade", "Premium", "Unique"],
    },
    {
      id: 2,
      name: "Wooden Coffee Table",
      price: "$245",
      rating: 4.9,
      reviews: 18,
      image: "/placeholder.svg",
      category: "Furniture",
      artisan: "Marcus Chen",
      tags: ["Sustainable", "Custom", "Oak Wood"],
    },
    {
      id: 3,
      name: "Embroidered Wall Art",
      price: "$135",
      rating: 5.0,
      reviews: 32,
      image: "/placeholder.svg",
      category: "Textiles",
      artisan: "Sophia Williams",
      tags: ["Modern", "Colorful", "Handwoven"],
    },
    {
      id: 4,
      name: "Leather Messenger Bag",
      price: "$198",
      rating: 4.7,
      reviews: 45,
      image: "/placeholder.svg",
      category: "Leather Goods",
      artisan: "David Thompson",
      tags: ["Durable", "Classic", "Full Grain"],
    },
    {
      id: 5,
      name: "Glass Wind Chimes",
      price: "$67",
      rating: 4.6,
      reviews: 28,
      image: "/placeholder.svg",
      category: "Glass Art",
      artisan: "Maria Santos",
      tags: ["Musical", "Colorful", "Outdoor"],
    },
    {
      id: 6,
      name: "Carved Wooden Bowl Set",
      price: "$156",
      rating: 4.9,
      reviews: 21,
      image: "/placeholder.svg",
      category: "Kitchenware",
      artisan: "James Wilson",
      tags: ["Food Safe", "Set of 4", "Cherry Wood"],
    },
  ];

  const mockArtisans = [
    {
      id: 1,
      name: "Elena Rodriguez",
      skill: "Ceramic Artist",
      location: "2.3 km away",
      rating: 4.9,
      image: "/placeholder.svg",
      specialties: ["Pottery", "Sculptures", "Tableware"],
    },
    {
      id: 2,
      name: "Marcus Chen",
      skill: "Woodworker",
      location: "3.1 km away",
      rating: 4.8,
      image: "/placeholder.svg",
      specialties: ["Furniture", "Carving", "Restoration"],
    },
    {
      id: 3,
      name: "Sophia Williams",
      skill: "Textile Artist",
      location: "1.8 km away",
      rating: 5.0,
      image: "/placeholder.svg",
      specialties: ["Weaving", "Embroidery", "Quilting"],
    },
    {
      id: 4,
      name: "David Thompson",
      skill: "Leather Craftsman",
      location: "4.2 km away",
      rating: 4.7,
      image: "/placeholder.svg",
      specialties: ["Bags", "Belts", "Wallets"],
    },
  ];

  const categories = ["All", "Ceramics", "Furniture", "Textiles", "Leather Goods", "Glass Art", "Kitchenware"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: chatHistory.length + 1,
      type: "user" as const,
      message: message,
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: chatHistory.length + 2,
        type: "bot" as const,
        message: "I understand you'd like a custom piece! Let me generate a 3D preview based on your description. This would be perfect for ceramic or wood crafting. Check the artisans tab to find specialists for this type of work.",
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleArtisanClick = (artisan: typeof mockArtisans[0]) => {
    toast("Please sign in to contact " + artisan.name, {
      description: "You need to be logged in to chat with artisans",
      action: {
        label: "Sign In",
        onClick: () => toast("Supabase authentication needed for full functionality"),
      },
    });
  };

  const handleProductClick = (product: typeof mockProducts[0]) => {
    toast("Product Details", {
      description: `${product.name} by ${product.artisan} - ${product.price}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Artisan Marketplace</h1>
          <p className="text-primary-foreground/90">Discover unique handcrafted items from local artisans</p>
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
            {categories.map((category) => (
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
              <p className="text-muted-foreground">{filteredProducts.length} items found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative">
                    <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-3 right-3 h-8 w-8 p-0 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast("Added to wishlist");
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
                        <p className="text-xl font-bold text-primary">{product.price}</p>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">by {product.artisan}</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{product.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 pt-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button className="w-full mt-3 bg-gradient-primary" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar with Tabs */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <Tabs defaultValue="ai-chat" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai-chat" className="flex items-center gap-1">
                    <Bot className="h-4 w-4" />
                    AI Chat
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
                      </h3>
                      <p className="text-sm text-muted-foreground">Get custom craft recommendations</p>
                    </div>

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
                        />
                        <Button onClick={handleSendMessage} size="sm">
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
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
                      {mockArtisans.map((artisan) => (
                        <Card
                          key={artisan.id}
                          className="cursor-pointer transition-all duration-200 hover:shadow-md"
                          onClick={() => handleArtisanClick(artisan)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={artisan.image} />
                                <AvatarFallback className="text-xs">
                                  {artisan.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {artisan.name}
                                </h4>
                                <p className="text-xs text-primary">
                                  {artisan.skill}
                                </p>
                                <div className="flex items-center mt-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span className="text-xs ml-1">{artisan.rating}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {artisan.location}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {artisan.specialties.slice(0, 2).map((specialty) => (
                                    <Badge key={specialty} variant="outline" className="text-xs px-1 py-0">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full mt-2 h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArtisanClick(artisan);
                              }}
                            >
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Contact
                              <Lock className="h-3 w-3 ml-1" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}