import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArtisans } from '@/services/artisans';
import { ArtisanProfile } from './ArtisanProfile';
import { 
  Star,
  MapPin,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CustomerArtisansList() {
  const [selectedArtisan, setSelectedArtisan] = useState(null);

  // Fetch all artisans without filters
  const { data: artisansData, isLoading } = useQuery({
    queryKey: ['artisans'],
    queryFn: () => getArtisans({})
  });

  const artisans = artisansData?.data?.artisans || [];

  return (
    <div className="h-full max-w-3xl mx-auto px-4">
      {/* Artisans List */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : artisans.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No artisans found
            </div>
          ) : (
            artisans.map((artisan) => (
              <Card
                key={artisan._id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedArtisan(artisan)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={artisan.user.profile?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {artisan.user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{artisan.user.name}</h3>
                          <p className="text-primary font-medium">{artisan.businessInfo.businessName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 font-medium">{artisan.ratings.average}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({artisan.ratings.count} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {artisan.businessInfo.description}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {artisan.location.city}, {artisan.location.state}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {artisan.skills.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                          {artisan.skills.specialties.length > 3 && (
                            <Badge variant="secondary">
                              +{artisan.skills.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Artisan Profile Modal */}
      {selectedArtisan && (
        <ArtisanProfile
          artisanId={selectedArtisan._id}
          isOpen={!!selectedArtisan}
          onClose={() => setSelectedArtisan(null)}
        />
      )}
    </div>
  );
}