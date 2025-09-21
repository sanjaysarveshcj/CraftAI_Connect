import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseRoleRedirectProps {
  onModuleChange: (module: "landing" | "customer" | "artisan" | "admin") => void;
  currentModule: "landing" | "customer" | "artisan" | "admin";
}

export const useRoleRedirect = ({ onModuleChange, currentModule }: UseRoleRedirectProps) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // If user logs out, redirect to landing
      if (currentModule !== 'landing') {
        onModuleChange('landing');
      }
      return;
    }

    // Map user roles to their default modules
    const roleModuleMap: Record<string, "customer" | "artisan" | "admin"> = {
      customer: 'customer',
      artisan: 'artisan',
      admin: 'admin'
    };

    const userDefaultModule = roleModuleMap[user.role];
    
    // If user is on landing page, redirect to their role-specific page
    if (currentModule === 'landing' && userDefaultModule) {
      onModuleChange(userDefaultModule);
      return;
    }

    // Check if user can access current module
    const canAccessModule = (module: string, userRole: string): boolean => {
      switch (module) {
        case 'customer':
          return userRole === 'customer';
        case 'artisan':
          return userRole === 'artisan';
        case 'admin':
          return userRole === 'admin';
        case 'landing':
          return true;
        default:
          return false;
      }
    };

    // If user cannot access current module, redirect to their default
    if (!canAccessModule(currentModule, user.role) && userDefaultModule) {
      onModuleChange(userDefaultModule);
    }
  }, [user, isAuthenticated, currentModule, onModuleChange]);

  return {
    canUserAccessModule: (module: string) => {
      if (!isAuthenticated || !user) return module === 'landing';
      
      switch (module) {
        case 'customer':
          return user.role === 'customer';
        case 'artisan':
          return user.role === 'artisan';
        case 'admin':
          return user.role === 'admin';
        case 'landing':
          return true;
        default:
          return false;
      }
    },
    userRole: user?.role || null,
    isAuthenticated
  };
};

export default useRoleRedirect;