import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { CustomerPage } from "@/components/CustomerPage";
import { ArtisanPage } from "@/components/ArtisanPage";
import { AdminPage } from "@/components/AdminPage";

const Index = () => {
  const [activeModule, setActiveModule] = useState<"landing" | "customer" | "artisan" | "admin">("landing");

  const renderContent = () => {
    switch (activeModule) {
      case "customer":
        return <CustomerPage />;
      case "artisan":
        return <ArtisanPage />;
      case "admin":
        return <AdminPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation activeModule={activeModule} onModuleChange={setActiveModule} />
      {renderContent()}
    </div>
  );
};

export default Index;
