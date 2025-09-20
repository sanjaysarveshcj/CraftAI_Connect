import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Camera, 
  MapPin, 
  Palette, 
  MessageSquare, 
  Package, 
  Clock,
  CheckCircle,
  DollarSign,
  Star,
  BookOpen,
  Play,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export const ArtisanPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    craft: "",
    experience: "",
    story: "",
    specialties: "",
  });

  const [isRegistered, setIsRegistered] = useState(false);

  const mockOrders = [
    {
      id: 1,
      customer: "Sarah Johnson",
      item: "Custom ceramic vase",
      status: "in-progress",
      amount: "$125",
      date: "2024-01-15",
      deadline: "2024-02-01",
    },
    {
      id: 2,
      customer: "Mike Davis",
      item: "Wooden jewelry box",
      status: "pending",
      amount: "$85",
      date: "2024-01-18",
      deadline: "2024-02-15",
    },
    {
      id: 3,
      customer: "Lisa Chen",
      item: "Hand-woven scarf",
      status: "completed",
      amount: "$95",
      date: "2024-01-10",
      deadline: "2024-01-25",
    },
  ];

  const mockChats = [
    {
      id: 1,
      customer: "Sarah Johnson",
      lastMessage: "When will my vase be ready?",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      customer: "Mike Davis",
      lastMessage: "Thank you for the update!",
      time: "1 day ago",
      unread: false,
    },
  ];

  const mockTutorials = [
    {
      id: 1,
      title: "Ceramic Vase Making",
      description: "Learn to create a beautiful ceramic vase from clay to glazing",
      difficulty: "Intermediate",
      duration: "3-4 hours",
      steps: [
        "Prepare your clay by wedging to remove air bubbles",
        "Center the clay on the potter's wheel",
        "Open the clay using your thumbs or fingers",
        "Pull up the walls slowly and evenly",
        "Shape the vase form with steady pressure",
        "Trim the bottom when leather-hard",
        "Apply your chosen glaze after bisque firing",
        "Fire to cone 6 for final result"
      ],
      tags: ["ceramics", "pottery", "wheel throwing"]
    },
    {
      id: 2,
      title: "Wooden Jewelry Box",
      description: "Craft an elegant wooden jewelry box with compartments",
      difficulty: "Advanced",
      duration: "6-8 hours",
      steps: [
        "Select and prepare your wood (walnut or cherry recommended)",
        "Cut pieces to size using precise measurements",
        "Create dados and rabbets for joints",
        "Sand all pieces starting with 120 grit, finish with 220",
        "Dry fit all pieces before gluing",
        "Apply wood glue and clamp securely",
        "Route compartment grooves while wood is flat",
        "Install hinges and add felt lining",
        "Apply finish (Danish oil or polyurethane)"
      ],
      tags: ["woodworking", "joinery", "furniture"]
    },
    {
      id: 3,
      title: "Hand-Woven Scarf",
      description: "Create a soft, colorful scarf using traditional weaving techniques",
      difficulty: "Beginner",
      duration: "2-3 hours",
      steps: [
        "Choose your yarn colors and calculate yardage needed",
        "Set up your loom with the warp threads",
        "Thread the heddles and reed properly",
        "Begin weaving with your chosen pattern",
        "Maintain consistent tension throughout",
        "Change colors as desired for your design",
        "Beat each row gently but firmly",
        "Remove from loom and secure edges",
        "Wet finish and block to measurements"
      ],
      tags: ["weaving", "textiles", "fiber arts"]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.craft) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    toast.success("Registration submitted! Your profile will be reviewed.");
    setIsRegistered(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in-progress": return <Clock className="h-4 w-4" />;
      case "pending": return <Package className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-warm p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center mb-2">
                <Palette className="h-6 w-6 mr-2 text-primary" />
                Artisan Registration
              </CardTitle>
              <p className="text-muted-foreground">
                Join our marketplace and showcase your craft to customers
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State"
                    />
                  </div>
                </div>

                {/* Craft Information */}
                <div>
                  <Label htmlFor="craft" className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Primary Craft *
                  </Label>
                  <Input
                    id="craft"
                    value={formData.craft}
                    onChange={(e) => setFormData(prev => ({ ...prev, craft: e.target.value }))}
                    placeholder="e.g., Ceramics, Woodworking, Textiles"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialties">Specialties</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                    placeholder="e.g., Pottery, Sculptures, Tableware (comma-separated)"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="story">Your Story</Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                    placeholder="Tell customers about your journey, inspiration, and what makes your craft special..."
                    rows={4}
                  />
                </div>

                {/* Photo Upload Placeholder */}
                <div>
                  <Label className="flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Portfolio Photos
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Upload photos of your work (File upload requires backend integration)
                    </p>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-primary border-0 shadow-primary">
                  Register as Artisan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Palette className="h-8 w-8 mr-3 text-primary" />
            Artisan Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your profile, orders, and customer communications</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold text-foreground">12</p>
                      </div>
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-foreground">$1,240</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-accent" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="text-2xl font-bold text-foreground">4.9</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{order.item}</h4>
                            <p className="text-sm text-muted-foreground">Customer: {order.customer}</p>
                            <p className="text-sm text-muted-foreground">Due: {order.deadline}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{order.amount}</p>
                          <Badge className={getStatusColor(order.status)} variant="secondary">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chats">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Customer Messages</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time chat requires backend integration
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockChats.map((chat) => (
                    <div key={chat.id} className="flex items-center space-x-4 p-4 bg-card rounded-lg border cursor-pointer hover:bg-muted/50">
                      <div className="relative">
                        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        {chat.unread && (
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{chat.customer}</h4>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{chat.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learn">
            <div className="grid gap-6">
              <Card className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    AI-Powered Craft Tutorials
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Learn step-by-step procedures for various crafts with AI-generated instructions
                  </p>
                </CardHeader>
              </Card>

              <div className="grid gap-4">
                {mockTutorials.map((tutorial) => (
                  <Card key={tutorial.id} className="bg-gradient-card border-0 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">{tutorial.title}</h3>
                          <p className="text-muted-foreground mb-3">{tutorial.description}</p>
                          <div className="flex items-center gap-4 mb-4">
                            <Badge className={getDifficultyColor(tutorial.difficulty)} variant="secondary">
                              {tutorial.difficulty}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {tutorial.duration}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tutorial.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button className="ml-4 bg-gradient-primary border-0 shadow-primary">
                          <Play className="h-4 w-4 mr-2" />
                          Start Tutorial
                        </Button>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1" />
                          Step-by-Step Procedure:
                        </h4>
                        <ol className="space-y-2">
                          {tutorial.steps.slice(0, 3).map((step, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                          {tutorial.steps.length > 3 && (
                            <li className="flex items-center text-sm text-muted-foreground ml-9">
                              <span>... and {tutorial.steps.length - 3} more steps</span>
                            </li>
                          )}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-card border-0">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-primary mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Request Custom Tutorial</h3>
                  <p className="text-muted-foreground mb-4">
                    Need help with a specific craft technique? Our AI can generate personalized step-by-step instructions.
                  </p>
                  <Button className="bg-gradient-primary border-0 shadow-primary">
                    Generate Custom Tutorial
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your artisan profile and story
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <Palette className="h-16 w-16 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Profile Features Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Edit profile, manage portfolio, update availability, and more...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};