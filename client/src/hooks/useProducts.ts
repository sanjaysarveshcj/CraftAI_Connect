import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, ProductFilters } from '@/services';

// Get products with filters
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsAPI.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single product
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getProduct(id),
    enabled: !!id,
  });
};

// Get product categories
export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productsAPI.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Search products
export const useProductSearch = (query: string, filters: Omit<ProductFilters, 'search'> = {}) => {
  return useQuery({
    queryKey: ['product-search', query, filters],
    queryFn: () => productsAPI.searchProducts(query, filters),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get featured products
export const useFeaturedProducts = (limit: number = 6) => {
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: () => productsAPI.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};