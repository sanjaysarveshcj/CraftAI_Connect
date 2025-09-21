import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  Package,
  Phone,
  Mail,
  Globe,
  Calendar,
  Heart,
  ShoppingCart,
  Send,
  User,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useStartConversation } from '@/hooks/useMessages';
import { getArtisanById } from '@/services/artisans';
import { Artisan, Product } from '@/services';

interface ArtisanProfileProps {
  artisanId: string;
  isOpen: boolean;
  onClose: () => void;
  onContactArtisan?: (artisan: Artisan) => void;
}

export function ArtisanProfile({ artisanId, isOpen, onClose, onContactArtisan }: ArtisanProfileProps) {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews'>('overview');
  const startConversationMutation = useStartConversation();

  // Fetch artisan data
  const { data: artisanData, isLoading, error } = useQuery({
    queryKey: ['artisan', artisanId],
    queryFn: () => getArtisanById(artisanId),
    enabled: !!artisanId && isOpen
  });

  const artisan = artisanData?.data?.artisan;
  const products = artisanData?.data?.products || [];

  const handleStartConversation = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to contact artisans");
      return;
    }

    if (!artisan) return;

    try {
      const response = await startConversationMutation.mutateAsync({
        artisanId: artisan._id,
        subject: `Inquiry about ${artisan.skills.primaryCraft}`,
        initialMessage: `Hello ${artisan.user.name}, I'm interested in your ${artisan.skills.primaryCraft} work. I'd like to discuss a potential project.`
      });

      if (response.success) {
        toast.success(`Started conversation with ${artisan.user.name}`);
        onClose();
        // Call the callback to open message center
        if (onContactArtisan) {
          onContactArtisan(artisan);
        }
      }
    } catch (error) {
      toast.error("Failed to start conversation");
      console.error('Start conversation error:', error);
    }
  };

  const handleQuickContact = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to contact artisans");
      return;
    }

    if (artisan?.user?.profile?.phone) {
      toast("Contact Information", {
        description: `Phone: ${artisan.user.profile.phone}`,
        duration: 5000,
        action: {
          label: "Call",
          onClick: () => window.open(`tel:${artisan.user.profile.phone}`)
        }
      });
    } else {
      toast("Contact via chat to get phone number");
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[600px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading artisan profile...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !artisan) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[600px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500">Failed to load artisan profile</p>
              <Button onClick={onClose} className="mt-4">Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={artisan.user.profile?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {artisan.user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{artisan.user.name}</DialogTitle>
                  <p className="text-lg text-primary font-medium">{artisan.businessInfo.businessName}</p>
                  <p className="text-muted-foreground">{artisan.skills.primaryCraft}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 font-medium">{artisan.ratings.average}</span>
                      <span className="text-muted-foreground ml-1">({artisan.ratings.count} reviews)</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {artisan.location.city}, {artisan.location.state}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleStartConversation}
                  disabled={!isAuthenticated || startConversationMutation.isPending}
                  className="bg-gradient-primary"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {startConversationMutation.isPending ? "Starting..." : "Start Chat"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleQuickContact}
                  disabled={!isAuthenticated}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Quick Contact
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="px-6 border-b">
            <nav className="flex space-x-8">
              {['overview', 'products', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Artisan Story */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Artisan Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {artisan.businessInfo.description || "No story available"}
                    </p>
                  </CardContent>
                </Card>

                {/* Expertise */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Expertise & Specialties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Primary Craft</h4>
                      <Badge variant="default" className="text-sm">
                        {artisan.skills.primaryCraft}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {artisan.skills.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {artisan.businessInfo.techniquesAndMaterials && (
                      <div>
                        <h4 className="font-medium mb-2">Techniques & Materials</h4>
                        <p className="text-muted-foreground">
                          {artisan.businessInfo.techniquesAndMaterials}
                        </p>
                      </div>
                    )}

                    {artisan.businessInfo.customOrderPreferences && (
                      <div>
                        <h4 className="font-medium mb-2">Custom Order Preferences</h4>
                        <p className="text-muted-foreground">
                          {artisan.businessInfo.customOrderPreferences}
                        </p>
                      </div>
                    )}

                    {artisan.businessInfo.achievements && (
                      <div>
                        <h4 className="font-medium mb-2">Notable Achievements</h4>
                        <p className="text-muted-foreground">
                          {artisan.businessInfo.achievements}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Experience Level</h4>
                      <Badge variant="outline">
                        {artisan.skills.experienceLevel}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Business Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Years of Experience</h4>
                        <p>{artisan.skills.yearsOfExperience} years</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Established</h4>
                        <p>{new Date(artisan.businessInfo.establishedYear).getFullYear()}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Response Time</h4>
                        <p>{artisan.businessInfo.responseTime || "Within 24 hours"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Availability</h4>
                        <Badge variant={artisan.availability.isActive ? "default" : "secondary"}>
                          {artisan.availability.isActive ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Information */}
                {artisan.pricing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Hourly Rate</p>
                          <p className="font-semibold">${artisan.pricing.hourlyRate || "Contact for quote"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Project Min</p>
                          <p className="font-semibold">${artisan.pricing.projectMinimum || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Consultation</p>
                          <p className="font-semibold">
                            {artisan.pricing.consultationFee ? `$${artisan.pricing.consultationFee}` : "Free"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Featured Products</h3>
                  <p className="text-sm text-muted-foreground">{products.length} products</p>
                </div>
                
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No products available yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: Product) => (
                      <Card key={product._id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                          <img 
                            src={
                              typeof product.images[0] === "string"
                                ? product.images[0]
                                : product.images[0]?.url || "/placeholder.svg"
                            }
                            alt={
                              typeof product.images[0] === "object" && product.images[0]?.alt
                                ? product.images[0].alt
                                : product.name
                            }
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm mb-1">{product.name}</h4>
                          <p className="text-primary font-semibold">${product.pricing.basePrice}</p>
                          <div className="flex items-center mt-2">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs ml-1">{product.ratings.average}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Reviews section coming soon</p>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Footer Actions */}
          <div className="border-t p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {!isAuthenticated && "Sign in to contact this artisan"}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  onClick={handleStartConversation}
                  disabled={!isAuthenticated || startConversationMutation.isPending}
                  className="bg-gradient-primary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ArtisanProfile;