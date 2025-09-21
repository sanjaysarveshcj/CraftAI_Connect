import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  Package,
  Phone,
  User,
  Building2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useStartConversation } from '@/hooks/useMessages';
import { getArtisanById } from '@/services/artisans';
import type { Artisan } from '@/services/artisans';

interface ArtisanProfileProps {
  artisanId: string;
  isOpen: boolean;
  onClose: () => void;
  onContactArtisan?: (artisan: Artisan) => void;
}

type TabType = 'overview' | 'products' | 'reviews';

export function ArtisanProfile({ artisanId, isOpen, onClose, onContactArtisan }: ArtisanProfileProps) {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  const startConversationMutation = useStartConversation();

  // Fetch artisan data
  const { data: artisanData, isLoading, error } = useQuery({
    queryKey: ['artisan', artisanId],
    queryFn: () => getArtisanById(artisanId),
    enabled: !!artisanId && isOpen
  });

  const artisan = artisanData?.data?.artisan;

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
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
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

  const renderOverviewTab = () => (
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
          <div className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <div>
                <p className="font-medium">Response Time</p>
                <p className="text-muted-foreground">
                  {artisan.businessInfo.responseTime || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground mr-2" />
              <div>
                <p className="font-medium">Minimum Order</p>
                <p className="text-muted-foreground">
                  {artisan.pricing?.minimumOrder 
                    ? `$${artisan.pricing.minimumOrder}`
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
                  onClick={() => setActiveTab(tab as TabType)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            {activeTab === 'overview' && renderOverviewTab()}

            {activeTab === 'products' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Product showcase coming soon...</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Customer reviews coming soon...</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}