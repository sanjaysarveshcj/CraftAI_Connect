import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MapPin, Star, MessageCircle, Lock } from "lucide-react";
import { toast } from "sonner";

type ChatMessage = {
  id: number;
  type: "bot" | "user";
  message: string;
};

export const CustomerPage = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 1,
      type: "bot" as const,
      message: "Hello! I'm your AI craft assistant. Describe the custom product you'd like to have made, and I'll help you visualize it and connect you with the perfect artisan.",
    },
  ]);

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
  ];

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
        message: "I understand you'd like a custom piece! Let me generate a 3D preview based on your description. This would be perfect for ceramic or wood crafting. Check the artisans on the right who specialize in this type of work.",
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

  return (
    <div className="h-screen bg-background flex">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gradient-primary p-4 text-white">
          <h2 className="text-xl font-semibold flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Craft Assistant
          </h2>
          <p className="text-primary-foreground/80 text-sm">
            Describe your vision and I'll help bring it to life
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-muted/20">
          <div className="space-y-4 max-w-4xl mx-auto">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  {msg.type === "bot" ? (
                    <div className="bg-primary rounded-full flex items-center justify-center h-full">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="bg-accent rounded-full flex items-center justify-center h-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </Avatar>
                <div
                  className={`flex-1 p-3 rounded-2xl ${
                    msg.type === "user"
                      ? "bg-primary text-white ml-12"
                      : "bg-card border mr-12"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}

            {/* 3D Preview Placeholder */}
            {chatHistory.length > 2 && (
              <Card className="mt-6 bg-gradient-card border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Bot className="h-5 w-5 mr-2 text-primary" />
                    3D Preview Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🏺</span>
                      </div>
                      <p className="text-muted-foreground">3D model would appear here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        (Requires Three.js integration)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex space-x-2 max-w-4xl mx-auto">
            <Input
              placeholder="Describe the craft you'd like made..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-gradient-primary border-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Artisans Panel */}
      <div className="w-80 bg-card border-l border-border">
        <div className="p-4 border-b bg-gradient-warm">
          <h3 className="font-semibold text-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            Nearby Artisans
          </h3>
          <p className="text-sm text-muted-foreground">
            Skilled craftspeople in your area
          </p>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-full">
          {mockArtisans.map((artisan) => (
            <Card
              key={artisan.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-card hover:scale-[1.02] bg-gradient-card border-0"
              onClick={() => handleArtisanClick(artisan)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={artisan.image} />
                    <AvatarFallback>{artisan.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {artisan.name}
                    </h4>
                    <p className="text-sm text-primary font-medium">
                      {artisan.skill}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground ml-1">
                        {artisan.rating}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {artisan.location}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {artisan.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-3 bg-gradient-primary border-0"
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
    </div>
  );
};