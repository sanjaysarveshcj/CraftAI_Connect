import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Sparkles, User, Star, MapPin, ExternalLink } from 'lucide-react';

interface DesignResult {
  id: string;
  designDescription: string;
  suggestedArtisans: Array<{
    _id: string;
    name: string;
    bio: string;
    specialties: string[];
    location: string;
    rating: number;
    profileImage?: string;
    portfolio: string[];
  }>;
  customizationSuggestions: string[];
  estimatedPrice: {
    min: number;
    max: number;
  };
  timeline: string;
}

interface DesignResultsProps {
  result: DesignResult;
  onContactArtisan: (artisanId: string) => void;
  onStartChat: () => void;
}

export function DesignResults({ result, onContactArtisan, onStartChat }: DesignResultsProps) {
  const [selectedArtisan, setSelectedArtisan] = useState<string | null>(null);

  // Add safety checks for required properties
  if (!result) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No design result available</p>
      </div>
    );
  }

  const estimatedPrice = result.estimatedPrice || { min: 0, max: 0 };
  const suggestedArtisans = result.suggestedArtisans || [];
  const customizationSuggestions = result.customizationSuggestions || [];

  return (
    <div className="space-y-6">
      {/* Design Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Generated Design Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {result.designDescription}
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Estimated Price Range</h4>
              <p className="text-2xl font-bold text-primary">
                ${estimatedPrice.min} - ${estimatedPrice.max}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Estimated Timeline</h4>
              <p className="text-lg font-medium">
                {result.timeline || 'Contact artisan for details'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Customization Ideas</CardTitle>
          <CardDescription>
            Consider these options to make your design unique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {customizationSuggestions.map((suggestion, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {suggestion}
              </Badge>
            ))}
            {customizationSuggestions.length === 0 && (
              <p className="text-muted-foreground text-sm">No customization suggestions available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Artisans */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Artisans</CardTitle>
          <CardDescription>
            These artisans specialize in your requested style and category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedArtisans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No artisan recommendations available</p>
            </div>
          ) : (
            suggestedArtisans.map((artisan) => (
            <div 
              key={artisan._id}
              className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                selectedArtisan === artisan._id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedArtisan(
                selectedArtisan === artisan._id ? null : artisan._id
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  {artisan.profileImage ? (
                    <img 
                      src={artisan.profileImage} 
                      alt={artisan.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary/70" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{artisan.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{artisan.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{artisan.location}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {artisan.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {artisan.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {artisan.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{artisan.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onContactArtisan(artisan._id);
                      }}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Artisan
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Could navigate to artisan profile
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onStartChat} className="flex-1">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat with AI for More Ideas
        </Button>
        <Button variant="outline" className="flex-1">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate New Design
        </Button>
      </div>
    </div>
  );
}