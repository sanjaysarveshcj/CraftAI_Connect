import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, MapPin, Star, MessageCircle, Lock, Heart, ShoppingCart, Search, Filter, X, Maximize2, Minimize2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateImage } from "../gemini";

type ChatMessage = {
  id: number;
  type: "bot" | "user";
  message: string;
  imageUrl?: string;
};

export function CustomerPage() {
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTab, setExpandedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ai-chat");
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: Date.now(), // Better than relying on array length
      type: "user" as const,
      message,
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage("");

    // Show thinking message
    setChatHistory(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        type: "bot" as const,
        message: "🎨 AI is crafting your vision... (using Google Gemini Pro)",
      },
    ]);
    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

      const prompt = `
  You are a friendly AI Craft Assistant helping users visualize custom handmade products.
  The user says: "${message}"

  Respond in valid JSON format only. No extra text or markdown.

  {
    "response": "Your conversational reply to the user",
    "imagePrompt": "A detailed prompt suitable for AI image generation (DALL·E/Stable Diffusion). If not applicable, leave empty.",
    "suggestedMaterials": ["list", "of", "materials"],
    "recommendedArtisanType": "e.g., Potter, Woodcarver, Textile Artist"
  }

  Example:
  {
    "response": "That sounds amazing! I can visualize a hand-carved wooden lamp with floral motifs.",
    "imagePrompt": "A hand-carved wooden table lamp with floral motifs, warm ambient lighting, artisanal style, rustic wood base, linen shade, cozy interior setting, high detail, 4K",
    "suggestedMaterials": ["Walnut Wood", "Linen", "Brass Fittings"],
    "recommendedArtisanType": "Woodcarver"
  }
  `;

      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();

      // Clean and parse JSON
      let aiData;
      try {
        // Remove markdown code block if present
        const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
        aiData = JSON.parse(cleaned);
      } catch (e) {
        console.error("Failed to parse AI response:", responseText);
        aiData = {
          response: "I'm still learning to interpret that — could you describe your idea in more detail?",
          imagePrompt: "",
          suggestedMaterials: [],
          recommendedArtisanType: "",
        };
      }

      // Simulate image preview (replace later with real image API)
      let imageUrl = "";
        if (aiData.imagePrompt) {
          try {
            imageUrl = await generateImage(aiData.imagePrompt);
          } catch (err) {
            console.error("Image generation failed:", err);
          }
        }

      // Format final bot message
      const aiResponseMessage = `
  ${aiData.response}

  ${aiData.imagePrompt ? `🖼️ *Preview Suggestion*: [View Generated Concept](${imageUrl})` : ""}

  🛠️ **Suggested Materials**: ${aiData.suggestedMaterials.join(", ") || "N/A"}  
  👨‍🎨 **Recommended Artisan Type**: ${aiData.recommendedArtisanType || "General Crafter"}

  ➡️ Check the **Artisans** tab to find a perfect match!
      `.trim();

      const aiResponse = {
        id: Date.now(),
        type: "bot" as const,
        message: `
      ${aiData.response}

      🛠️ **Suggested Materials**: ${aiData.suggestedMaterials.join(", ") || "N/A"}  
      👨‍🎨 **Recommended Artisan Type**: ${aiData.recommendedArtisanType || "General Crafter"}

      ➡️ Check the **Artisans** tab to find a perfect match!
        `.trim(),
        imageUrl: aiData.imagePrompt ? imageUrl : undefined, // 👈 Attach image URL here
      };

      setChatHistory(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now() + 3,
          type: "bot" as const,
          message: "⚠️ Oops! Failed to reach AI. Check your API key or try again.",
        },
      ]);
    }finally {
  setIsGenerating(false);
}
  };

  const handleArtisanClick = (artisan: typeof mockArtisans[0]) => {
    alert(`Contact ${artisan.name}\n\nYou need to be logged in to chat with artisans.\nSupabase authentication needed for full functionality.`);
  };

  const handleProductClick = (product: typeof mockProducts[0]) => {
    alert(`Product Details\n\n${product.name} by ${product.artisan} - ${product.price}`);
  };

  const handleTabExpand = (tabValue: string) => {
    setActiveTab(tabValue);
    // Small delay to ensure the tab content is rendered before expanding
    setTimeout(() => {
      setExpandedTab(tabValue);
    }, 50);
  };

  const handleTabCollapse = () => {
    setExpandedTab(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
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
                          alert("Added to wishlist!");
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center">
                          <Bot className="h-4 w-4 mr-2 text-primary" />
                          AI Assistant
                        </h3>
                        <p className="text-sm text-muted-foreground">Get custom craft recommendations</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTabExpand("ai-chat")}
                        className="h-8 w-8 p-0 hover:bg-muted transition-all duration-200 hover:rotate-90"
                      >
                        <Maximize2 className="h-4 w-4 transition-transform duration-200" />
                      </Button>
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
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {/* Text Message */}
                            <p className="whitespace-pre-line">{msg.message}</p>

                            {/* Image Preview */}
                            {msg.imageUrl && (
                              <div className="mt-2 relative">
                                <img
                                  src={msg.imageUrl}
                                  alt="AI-generated product preview"
                                  className="rounded-lg border bg-white p-1 max-w-full h-auto shadow-sm"
                                  style={{ maxHeight: '250px', objectFit: 'contain' }}
                                  onError={(e) => {
                                    console.error("Image failed to load:", e);
                                    // Fallback image if needed
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                            )}
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
                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          Nearby Artisans
                        </h3>
                        <p className="text-sm text-muted-foreground">Connect with local craftspeople</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTabExpand("artisans")}
                        className="h-8 w-8 p-0 hover:bg-muted transition-all duration-200 hover:rotate-90"
                      >
                        <Maximize2 className="h-4 w-4 transition-transform duration-200" />
                      </Button>
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

      {/* Expanded Modal Overlay */}
      {expandedTab && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleTabCollapse}
        >
          <div 
            className="bg-background rounded-lg shadow-2xl border animate-zoomIn"
            style={{
              width: 'min(90vw, 800px)',
              height: 'min(90vh, 600px)',
              aspectRatio: '4/3',
              transformOrigin: 'center',
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex flex-col h-full">
              {/* Expanded Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  {expandedTab === "ai-chat" ? (
                    <>
                      <div className="bg-primary rounded-full p-2">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">AI Craft Assistant</h2>
                        <p className="text-muted-foreground">Get personalized recommendations and 3D previews</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-primary rounded-full p-2">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Local Artisans</h2>
                        <p className="text-muted-foreground">Connect with skilled craftspeople in your area</p>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTabCollapse}
                  className="h-10 w-10 p-0 rounded-full hover:bg-muted transition-all duration-200 hover:rotate-180"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Expanded Content */}
              <div className="flex-1 overflow-hidden">
                {expandedTab === "ai-chat" ? (
                  <div className="h-full flex flex-col">
                    {/* Chat Messages - Expanded */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                      {chatHistory.map((msg, index) => (
                        <div
                          key={msg.id}
                          className={`flex items-start space-x-3 animate-fadeIn ${
                            msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                          style={{animationDelay: `${index * 0.05}s`}}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            {msg.type === "bot" ? (
                              <div className="bg-primary rounded-full flex items-center justify-center h-full">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="bg-accent rounded-full flex items-center justify-center h-full">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </Avatar>
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              msg.type === "user"
                                ? "bg-primary text-white"
                                : "bg-muted"
                            }`}
                          >
                            <p className="leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Input - Expanded */}
                    <div className="p-6 border-t bg-muted/20">
                      <div className="flex space-x-4">
                        <Input
                          placeholder="Describe your custom craft idea in detail..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="flex-1 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                        />
                        <Button 
                          onClick={handleSendMessage} 
                          className="h-12 px-6 transition-all duration-200 hover:scale-105"
                        >
                          <Send className="h-5 w-5 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
                      {mockArtisans.map((artisan, index) => (
                        <Card
                          key={artisan.id}
                          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-slideUp"
                          onClick={() => handleArtisanClick(artisan)}
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="h-16 w-16 flex-shrink-0">
                                <AvatarImage src={artisan.image} />
                                <AvatarFallback className="text-lg font-semibold">
                                  {artisan.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-xl mb-1">
                                  {artisan.name}
                                </h3>
                                <p className="text-primary font-medium mb-2">
                                  {artisan.skill}
                                </p>
                                <div className="flex items-center mb-3">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="ml-1 font-medium">{artisan.rating}</span>
                                  <span className="text-muted-foreground ml-3 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {artisan.location}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">Specialties:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {artisan.specialties.map((specialty) => (
                                      <Badge key={specialty} variant="outline">
                                        {specialty}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button 
                              className="w-full mt-4 h-10 transition-all duration-200 hover:scale-105"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArtisanClick(artisan);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Start Conversation
                              <Lock className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
