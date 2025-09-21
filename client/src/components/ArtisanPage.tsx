import { useState, useEffect } from "react";
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
  ChevronRight,
  ExternalLink,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useArtisanStatus, useRegisterArtisan, useArtisanDashboard } from "@/hooks/useArtisans";
import { ArtisanMessagesPage } from "./ArtisanMessagesPage";
import { RoleGuard } from "./RoleGuard";

export const ArtisanPage = () => {
  return (
    <RoleGuard allowedRoles={['artisan']}>
      <ArtisanPageContent />
    </RoleGuard>
  );
};

const ArtisanPageContent = () => {
  const { user } = useAuth();
  const [showFullMessages, setShowFullMessages] = useState(false);

  // Project upload form state

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "Art",
    subcategory: "",
    imageFile: null,
    basePrice: "",
    currency: "USD",
    priceType: "fixed",
    dimensions: { length: "", width: "", height: "", unit: "cm" },
    weight: { value: "", unit: "kg" },
    materials: "",
    colors: "",
    finishes: "",
    isCustomizable: false,
    customOptions: "",
    estimatedTime: "",
    difficulty: "intermediate",
    techniques: "",
    tools: "",
    inStock: true,
    quantity: "1",
    isUnique: true,
    tags: "",
    isActive: true,
    isFeatured: false
  });

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, files, checked } = e.target as HTMLInputElement;
    if (type === "file" && files && files.length > 0) {
      setProductForm((prev) => ({ ...prev, imageFile: files[0] }));
    } else if (type === "checkbox") {
      setProductForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file" && files && files.length > 0) {
      setProductForm((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProductUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (key === "imageFile" && value) {
        formData.append("image", value as File);
      } else if (typeof value === "object" && value !== null) {
        // For nested objects like dimensions, weight
        Object.entries(value).forEach(([subKey, subValue]) => {
          formData.append(`${key}.${subKey}`, subValue as string);
        });
      } else {
        formData.append(key, value as string);
      }
    });
    // TODO: Implement API call to upload product to products collection using formData
    toast.success("Product uploaded (mock)");
    setProductForm({
      name: "",
      description: "",
      category: "Art",
      subcategory: "",
      imageFile: null,
      basePrice: "",
      currency: "USD",
      priceType: "fixed",
      dimensions: { length: "", width: "", height: "", unit: "cm" },
      weight: { value: "", unit: "kg" },
      materials: "",
      colors: "",
      finishes: "",
      isCustomizable: false,
      customOptions: "",
      estimatedTime: "",
      difficulty: "intermediate",
      techniques: "",
      tools: "",
      inStock: true,
      quantity: "1",
      isUnique: true,
      tags: "",
      isActive: true,
      isFeatured: false
    });
  };
  
  // Check artisan registration status
  const { data: statusData, isLoading: statusLoading, error: statusError } = useArtisanStatus();
  const registerMutation = useRegisterArtisan();
  const { data: dashboardData, isLoading: dashboardLoading } = useArtisanDashboard();

  const hasProfile = statusData?.data?.hasProfile;
  const isComplete = statusData?.data?.isComplete;

  // Registration form state
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    primaryCraft: "",
    specialties: "",
    yearsOfExperience: "",
    city: "",
    state: "",
    address: "",
    hourlyRate: "",
    phone: ""
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.primaryCraft) {
      toast.error("Please fill in business name and primary craft");
      return;
    }

    const artisanData = {
      businessInfo: {
        businessName: formData.businessName,
        description: formData.description,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
      },
      skills: {
        primaryCraft: formData.primaryCraft,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s)
      },
      location: {
        city: formData.city,
        state: formData.state,
        address: formData.address
      },
      pricing: {
        hourlyRate: parseFloat(formData.hourlyRate) || 0
      }
    };

    try {
      await registerMutation.mutateAsync(artisanData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // Mock data for dashboard (you can replace with real API calls later)
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

  // Show loading state
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your artisan profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (statusError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load artisan profile</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Show full messages if requested
  if (showFullMessages) {
    return <ArtisanMessagesPage />;
  }

  // Show registration form if no profile exists
  if (!hasProfile || !isComplete) {
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
                Complete your artisan profile to start showcasing your craft
              </p>
              {user && (
                <p className="text-sm text-muted-foreground">
                  Welcome, {user.name}! Let's set up your artisan profile.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  
                  <div>
                    <Label htmlFor="businessName" className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      Business Name *
                    </Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Your craft business name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your craft business, specialties, and what makes you unique..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Craft Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Craft Information</h3>
                  
                  <div>
                    <Label htmlFor="primaryCraft" className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      Primary Craft *
                    </Label>
                    <Input
                      id="primaryCraft"
                      value={formData.primaryCraft}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryCraft: e.target.value }))}
                      placeholder="e.g., Ceramics, Woodworking, Textiles, Jewelry"
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
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        City
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Your city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Your state"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Workshop Address (Optional)</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address (for local pickup/visits)"
                    />
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>
                  
                  <div>
                    <Label htmlFor="hourlyRate" className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Hourly Rate (Optional)
                    </Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="50.00"
                    />
                  </div>
                </div>

                {/* Photo Upload Placeholder */}
                <div>
                  <Label className="flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Portfolio Photos (Coming Soon)
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Photo upload feature will be available soon
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary border-0 shadow-primary"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show artisan dashboard for registered users
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Palette className="h-8 w-8 mr-3 text-primary" />
            Artisan Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your profile, orders, and customer communications
          </p>
          {statusData?.data?.artisan && (
            <p className="text-sm text-muted-foreground mt-1">
              {statusData.data.artisan.businessName} • {statusData.data.artisan.primaryCraft}
            </p>
          )}
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
            <TabsTrigger value="product-upload" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Product Upload
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
                        <p className="text-2xl font-bold text-foreground">
                          {dashboardData?.data?.statistics?.orders?.total || 0}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          ${dashboardData?.data?.statistics?.revenue?.monthly || 0}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          {dashboardData?.data?.artisan?.rating || 0}
                        </p>
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
                    {dashboardLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading orders...</p>
                      </div>
                    ) : dashboardData?.data?.recentOrders?.length > 0 ? (
                      dashboardData.data.recentOrders.map((order: any) => (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {order.items?.[0]?.product?.name || 'Custom Order'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Customer: {order.customer?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Date: {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">${order.totalAmount}</p>
                            <Badge className={getStatusColor(order.status)} variant="secondary">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      mockOrders.map((order) => (
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chats">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Customer Messages
                  <Button 
                    onClick={() => setShowFullMessages(true)}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Full Messages
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage customer conversations and order requests
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Customer Messages</p>
                    <p className="text-sm mb-4">
                      Manage all your customer conversations and order requests in one place
                    </p>
                    <Button 
                      onClick={() => setShowFullMessages(true)}
                      className="bg-gradient-primary"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Message Center
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-primary">0</div>
                      <div className="text-sm text-muted-foreground">Unread Messages</div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-amber-500">0</div>
                      <div className="text-sm text-muted-foreground">Pending Orders</div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">0</div>
                      <div className="text-sm text-muted-foreground">Active Conversations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="product-upload">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-primary" />
                  Upload New Product
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill in all product details to market your products to customers.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleProductUpload}>
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" value={productForm.name} onChange={handleProductFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={productForm.description} onChange={handleProductFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" value={productForm.category} onChange={handleProductFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input id="subcategory" name="subcategory" value={productForm.subcategory} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="image">Product Image</Label>
                    <Input id="image" name="image" type="file" accept="image/*" onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="basePrice">Base Price</Label>
                    <Input id="basePrice" name="basePrice" type="number" value={productForm.basePrice} onChange={handleProductFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" name="currency" value={productForm.currency} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="priceType">Price Type</Label>
                    <Input id="priceType" name="priceType" value={productForm.priceType} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label>Dimensions (cm)</Label>
                    <div className="flex gap-2">
                      <Input name="length" placeholder="Length" value={productForm.dimensions.length} onChange={e => setProductForm(f => ({ ...f, dimensions: { ...f.dimensions, length: e.target.value } }))} />
                      <Input name="width" placeholder="Width" value={productForm.dimensions.width} onChange={e => setProductForm(f => ({ ...f, dimensions: { ...f.dimensions, width: e.target.value } }))} />
                      <Input name="height" placeholder="Height" value={productForm.dimensions.height} onChange={e => setProductForm(f => ({ ...f, dimensions: { ...f.dimensions, height: e.target.value } }))} />
                      <Input name="unit" placeholder="Unit" value={productForm.dimensions.unit} onChange={e => setProductForm(f => ({ ...f, dimensions: { ...f.dimensions, unit: e.target.value } }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <div className="flex gap-2">
                      <Input name="value" placeholder="Value" value={productForm.weight.value} onChange={e => setProductForm(f => ({ ...f, weight: { ...f.weight, value: e.target.value } }))} />
                      <Input name="unit" placeholder="Unit" value={productForm.weight.unit} onChange={e => setProductForm(f => ({ ...f, weight: { ...f.weight, unit: e.target.value } }))} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="materials">Materials (comma separated)</Label>
                    <Input id="materials" name="materials" value={productForm.materials} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="colors">Colors (comma separated)</Label>
                    <Input id="colors" name="colors" value={productForm.colors} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="finishes">Finishes (comma separated)</Label>
                    <Input id="finishes" name="finishes" value={productForm.finishes} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="isCustomizable">Customizable</Label>
                    <Input id="isCustomizable" name="isCustomizable" type="checkbox" checked={productForm.isCustomizable} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="customOptions">Custom Options (comma separated)</Label>
                    <Input id="customOptions" name="customOptions" value={productForm.customOptions} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="estimatedTime">Estimated Production Time</Label>
                    <Input id="estimatedTime" name="estimatedTime" value={productForm.estimatedTime} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Input id="difficulty" name="difficulty" value={productForm.difficulty} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="techniques">Techniques (comma separated)</Label>
                    <Input id="techniques" name="techniques" value={productForm.techniques} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="tools">Tools (comma separated)</Label>
                    <Input id="tools" name="tools" value={productForm.tools} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="inStock">In Stock</Label>
                    <Input id="inStock" name="inStock" type="checkbox" checked={productForm.inStock} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" value={productForm.quantity} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="isUnique">Is Unique</Label>
                    <Input id="isUnique" name="isUnique" type="checkbox" checked={productForm.isUnique} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" name="tags" value={productForm.tags} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="isActive">Active</Label>
                    <Input id="isActive" name="isActive" type="checkbox" checked={productForm.isActive} onChange={handleProductFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="isFeatured">Featured</Label>
                    <Input id="isFeatured" name="isFeatured" type="checkbox" checked={productForm.isFeatured} onChange={handleProductFormChange} />
                  </div>
                  <Button type="submit" className="bg-gradient-primary">Upload Product</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Removed tutorial-related code. Tabs and JSX structure fixed. */}

          <TabsContent value="profile">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your artisan profile and portfolio
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <User className="h-16 w-16 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Profile Editing Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Soon you'll be able to edit your profile, manage portfolio, update availability, and more...
                  </p>
                  {statusData?.data?.artisan && (
                    <div className="bg-muted/20 rounded-lg p-4 mt-6">
                      <h4 className="font-medium mb-2">Current Profile Info</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Business: {statusData.data.artisan.businessName}</p>
                        <p>Craft: {statusData.data.artisan.primaryCraft}</p>
                        <p>Status: {statusData.data.artisan.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};