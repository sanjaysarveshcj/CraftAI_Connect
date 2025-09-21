import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artisansAPI, ArtisanFilters } from '@/services';
import { toast } from 'sonner';

// Get artisans with filters
export const useArtisans = (filters: ArtisanFilters = {}) => {
  return useQuery({
    queryKey: ['artisans', filters],
    queryFn: () => artisansAPI.getArtisans(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search artisans by location name
export const useArtisanSearch = (location: string, radius: number = 25, limit: number = 10) => {
  return useQuery({
    queryKey: ['artisan-search', location, radius, limit],
    queryFn: () => artisansAPI.searchArtisans(location, radius, limit),
    enabled: location.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Get nearby artisans by coordinates
export const useNearbyArtisans = (latitude?: number, longitude?: number, radius: number = 25, limit: number = 10) => {
  return useQuery({
    queryKey: ['nearby-artisans', latitude, longitude, radius, limit],
    queryFn: () => artisansAPI.getNearbyArtisans(latitude!, longitude!, radius, limit),
    enabled: latitude !== undefined && longitude !== undefined,
    staleTime: 5 * 60 * 1000,
  });
};

// Get single artisan
export const useArtisan = (id: string) => {
  return useQuery({
    queryKey: ['artisan', id],
    queryFn: () => artisansAPI.getArtisan(id),
    enabled: !!id,
  });
};

// Get artisan's products
export const useArtisanProducts = (id: string, page: number = 1, limit: number = 12) => {
  return useQuery({
    queryKey: ['artisan-products', id, page, limit],
    queryFn: () => artisansAPI.getArtisanProducts(id, page, limit),
    enabled: !!id,
  });
};

// Get artisan skills
export const useArtisanSkills = () => {
  return useQuery({
    queryKey: ['artisan-skills'],
    queryFn: () => artisansAPI.getSkills(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Contact artisan mutation
export const useContactArtisan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, message, subject }: { id: string; message: string; subject?: string }) =>
      artisansAPI.contactArtisan(id, message, subject),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
    },
  });
};

// Check artisan status
export const useArtisanStatus = () => {
  return useQuery({
    queryKey: ['artisan-status'],
    queryFn: () => artisansAPI.checkArtisanStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Register artisan mutation
export const useRegisterArtisan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (artisanData: any) => artisansAPI.registerArtisan(artisanData),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['artisan-status'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to register artisan';
      toast.error(message);
    },
  });
};

// Get artisan dashboard
export const useArtisanDashboard = () => {
  return useQuery({
    queryKey: ['artisan-dashboard'],
    queryFn: () => artisansAPI.getArtisanDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get artisan profile for editing
export const useArtisanProfileData = () => {
  return useQuery({
    queryKey: ['artisan-profile'],
    queryFn: () => artisansAPI.getArtisanProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};