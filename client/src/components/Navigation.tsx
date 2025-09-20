import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Palette, Shield, Sparkles } from "lucide-react";

interface NavigationProps {
  activeModule: "landing" | "customer" | "artisan" | "admin";
  onModuleChange: (module: "landing" | "customer" | "artisan" | "admin") => void;
}

export const Navigation = ({ activeModule, onModuleChange }: NavigationProps) => {
  const modules = [
    {
      id: "customer" as const,
      title: "Customer",
      description: "Discover & order custom crafts",
      icon: Users,
      gradient: "bg-gradient-primary",
    },
    {
      id: "artisan" as const,
      title: "Artisan",
      description: "Showcase your craft & connect",
      icon: Palette,
      gradient: "bg-gradient-warm",
    },
    {
      id: "admin" as const,
      title: "Admin",
      description: "Manage marketplace & analytics",
      icon: Shield,
      gradient: "bg-gradient-hero",
    },
  ];

  if (activeModule === "landing") {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="container mx-auto px-4 py-12">
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
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Card 
                  key={module.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-primary bg-gradient-card border-0"
                  onClick={() => onModuleChange(module.id)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex p-4 rounded-2xl ${module.gradient} mb-6 group-hover:shadow-glow transition-all duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-foreground">
                      {module.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {module.description}
                    </p>
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
    );
  }

  return (
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
          
          <div className="flex space-x-1">
            {modules.map((module) => (
              <Button
                key={module.id}
                variant={activeModule === module.id ? "default" : "ghost"}
                onClick={() => onModuleChange(module.id)}
                className="transition-all duration-200"
              >
                <module.icon className="h-4 w-4 mr-2" />
                {module.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};