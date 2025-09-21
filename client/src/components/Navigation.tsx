import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Palette, Shield, Sparkles, LogIn, LogOut, User, ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { CartModal } from "./CartModal";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/useCart";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface NavigationProps {
  activeModule: "landing" | "customer" | "artisan" | "admin";
  onModuleChange: (module: "landing" | "customer" | "artisan" | "admin") => void;
}

export const Navigation = ({ activeModule, onModuleChange }: NavigationProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [showCartModal, setShowCartModal] = useState(false);

  // Cart hooks
  const { data: cartData, isLoading: cartLoading } = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const cartItems = cartData?.data?.cart || [];
  const cartItemCount = cartItems.reduce((total: number, item: any) => {
    return total + (item?.quantity || 0);
  }, 0);

  // Define modules with role restrictions
  const allModules = [
    {
      id: "customer" as const,
      title: "Customer",
      description: "Discover & order custom crafts",
      icon: Users,
      gradient: "bg-gradient-primary",
      allowedRoles: ["customer"],
    },
    {
      id: "artisan" as const,
      title: "Artisan",
      description: "Showcase your craft & connect",
      icon: Palette,
      gradient: "bg-gradient-warm",
      allowedRoles: ["artisan"],
    },
    {
      id: "admin" as const,
      title: "Admin",
      description: "Manage marketplace & analytics",
      icon: Shield,
      gradient: "bg-gradient-hero",
      allowedRoles: ["admin"],
    },
  ];

  // Filter modules based on user role
  const getAvailableModules = () => {
    if (!isAuthenticated || !user) return allModules;
    
    return allModules.filter(module => 
      module.allowedRoles.includes(user.role)
    );
  };

  const availableModules = getAvailableModules();

  // Check if user can access current module
  const canAccessCurrentModule = () => {
    if (activeModule === "landing") return true;
    if (!isAuthenticated || !user) return false;
    
    const currentModule = allModules.find(m => m.id === activeModule);
    return currentModule ? currentModule.allowedRoles.includes(user.role) : false;
  };

  // Redirect to appropriate module based on user role
  const getDefaultModuleForRole = (role: string) => {
    switch (role) {
      case 'customer':
        return 'customer';
      case 'artisan':
        return 'artisan';
      case 'admin':
        return 'admin';
      default:
        return 'landing';
    }
  };

  // Handle module change with role validation
  const handleModuleChange = (module: "landing" | "customer" | "artisan" | "admin") => {
    if (module === "landing") {
      onModuleChange(module);
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error("Please login to access this page");
      setShowAuthModal(true);
      return;
    }

    const targetModule = allModules.find(m => m.id === module);
    if (targetModule && !targetModule.allowedRoles.includes(user.role)) {
      toast.error(`Access denied. This page is for ${targetModule.allowedRoles.join(', ')} users only.`);
      return;
    }

    onModuleChange(module);
  };

  const handleAuthClick = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateCartItemMutation.mutateAsync({ itemId: productId, quantity });
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCartMutation.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const handleCheckout = async () => {
    toast.success('Checkout feature coming soon!');
    setShowCartModal(false);
  };

  if (activeModule === "landing") {
    return (
      <>
        <div className="min-h-screen bg-gradient-warm">
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-end mb-6">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user?.profile?.avatar} />
                        <AvatarFallback>
                          {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {user?.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium border-b">
                      Role: {user?.role}
                    </div>
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAuthClick('login')}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button onClick={() => handleAuthClick('register')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="h-12 w-12 text-primary mr-3" />
                <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  CraftConnect
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI-powered marketplace connecting customers with local artisans. 
                Describe your vision, see it in 3D, connect with skilled craftspeople.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {allModules.map((module) => {
                const Icon = module.icon;
                const userCanAccess = isAuthenticated && user && module.allowedRoles.includes(user.role);
                
                return (
                  <Card 
                    key={module.id}
                    className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-primary bg-gradient-card border-0 ${
                      userCanAccess ? 'ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => handleModuleChange(module.id)}
                  >
                    <CardContent className="p-8 text-center">
                      <div className={`inline-flex p-4 rounded-2xl ${module.gradient} mb-6 group-hover:shadow-glow transition-all duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-3 text-foreground">
                        {module.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {module.description}
                      </p>
                      
                      {/* Role access indicator */}
                      <div className="flex justify-center">
                        {isAuthenticated && user ? (
                          userCanAccess ? (
                            <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30">
                              ✓ Your Dashboard
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-muted">
                              For {module.allowedRoles.join(', ')} users
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-muted">
                            Login required
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">
                Choose your role to get started
              </p>
            </div>
          </div>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          defaultTab={authModalTab}
        />
      </>
    );
  }

  return (
    <>
      <nav className="bg-card border-b border-border shadow-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onModuleChange("landing")}
            >
              <Sparkles className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">CraftConnect</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {availableModules.map((module) => (
                  <Button
                    key={module.id}
                    variant={activeModule === module.id ? "default" : "ghost"}
                    onClick={() => handleModuleChange(module.id)}
                    className="transition-all duration-200"
                  >
                    <module.icon className="h-4 w-4 mr-2" />
                    {module.title}
                  </Button>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* Cart Button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCartModal(true)}
                    className="relative"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.profile?.avatar} />
                          <AvatarFallback>
                            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {user?.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm font-medium border-b">
                        Role: {user?.role}
                      </div>
                      <DropdownMenuItem onClick={() => setShowCartModal(true)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart ({cartItemCount})
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAuthClick('login')}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button onClick={() => handleAuthClick('register')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
      
      {isAuthenticated && (
        <CartModal 
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          isLoading={cartLoading}
        />
      )}
    </>
  );
};