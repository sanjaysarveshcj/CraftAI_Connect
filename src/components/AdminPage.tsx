import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Palette, 
  Package, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export const AdminPage = () => {
  const mockStats = {
    totalCustomers: 247,
    totalArtisans: 89,
    totalOrders: 156,
    revenue: 12450,
    pendingApprovals: 7,
    activeDisputes: 3,
  };

  const mockArtisans = [
    {
      id: 1,
      name: "Elena Rodriguez",
      craft: "Ceramics",
      status: "approved",
      orders: 23,
      rating: 4.9,
      joinedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Marcus Chen",
      craft: "Woodworking",
      status: "pending",
      orders: 0,
      rating: 0,
      joinedDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Sophia Williams",
      craft: "Textiles",
      status: "approved",
      orders: 31,
      rating: 5.0,
      joinedDate: "2024-01-10",
    },
  ];

  const mockOrders = [
    {
      id: 1,
      customer: "Sarah Johnson",
      artisan: "Elena Rodriguez",
      item: "Custom ceramic vase",
      amount: "$125",
      status: "in-progress",
      date: "2024-01-18",
    },
    {
      id: 2,
      customer: "Mike Davis",
      artisan: "Marcus Chen",
      item: "Wooden jewelry box",
      amount: "$85",
      status: "pending",
      date: "2024-01-19",
    },
    {
      id: 3,
      customer: "Lisa Chen",
      artisan: "Sophia Williams",
      item: "Hand-woven scarf",
      amount: "$95",
      status: "completed",
      date: "2024-01-17",
    },
  ];

  const mockPopularCrafts = [
    { craft: "Ceramics", orders: 45, percentage: 30 },
    { craft: "Woodworking", orders: 38, percentage: 25 },
    { craft: "Textiles", orders: 32, percentage: 21 },
    { craft: "Jewelry", orders: 23, percentage: 15 },
    { craft: "Glasswork", orders: 14, percentage: 9 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "blocked": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      case "blocked": return <XCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage the CraftConnect marketplace ecosystem
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="text-xl font-bold text-foreground">{mockStats.totalCustomers}</p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Artisans</p>
                  <p className="text-xl font-bold text-foreground">{mockStats.totalArtisans}</p>
                </div>
                <Palette className="h-6 w-6 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="text-xl font-bold text-foreground">{mockStats.totalOrders}</p>
                </div>
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold text-foreground">${mockStats.revenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-foreground">{mockStats.pendingApprovals}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Disputes</p>
                  <p className="text-xl font-bold text-foreground">{mockStats.activeDisputes}</p>
                </div>
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="artisans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="artisans" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Artisans
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Disputes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artisans">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Artisan Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and manage artisan applications and profiles
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockArtisans.map((artisan) => (
                    <div key={artisan.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Palette className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{artisan.name}</h4>
                          <p className="text-sm text-muted-foreground">{artisan.craft}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {artisan.orders} orders
                            </span>
                            {artisan.rating > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ⭐ {artisan.rating}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Joined {artisan.joinedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(artisan.status)} variant="secondary">
                          {getStatusIcon(artisan.status)}
                          <span className="ml-1">{artisan.status}</span>
                        </Badge>
                        {artisan.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monitor all orders and transactions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{order.item}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.customer} → {order.artisan}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-foreground">{order.amount}</span>
                        <Badge className={getStatusColor(order.status)} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Popular Crafts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPopularCrafts.map((craft, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-primary/20 rounded flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{craft.craft}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-muted-foreground">
                            {craft.orders} orders
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {craft.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Platform Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <BarChart3 className="h-16 w-16 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground">
                      Detailed charts, trends, and insights coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disputes">
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Dispute Resolution
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Handle customer and artisan disputes
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Disputes</h3>
                  <p className="text-muted-foreground">
                    All conflicts have been resolved. Great work!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};