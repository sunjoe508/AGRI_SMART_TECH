
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Home, User, Droplets, BarChart3, MessageSquare, Phone, ShoppingCart, Settings, Cloud } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileManagement from "@/components/ProfileManagement";
import EnhancedIrrigationCycle from "@/components/EnhancedIrrigationCycle";
import SensorMonitoring from "@/components/SensorMonitoring";
import CustomerSupport from "@/components/CustomerSupport";
import OTPManager from "@/components/OTPManager";
import VendorMarketplace from "@/components/VendorMarketplace";
import WeatherWidget from "@/components/WeatherWidget";
import AdminDashboard from "@/components/AdminDashboard";

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      // User is not admin, continue as normal user
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "👋 Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      toast({
        title: "❌ Sign Out Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 dark:text-green-200 font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 bg-fixed relative"
         style={{
           backgroundImage: `url("https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1920&q=80")`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed',
         }}>
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/85 dark:bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border-b-4 border-green-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🌱</div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">AgriSmart</h1>
                  <p className="text-sm text-green-600 dark:text-green-300">Smart Farming Management System</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back,</p>
                  <p className="font-semibold text-green-800 dark:text-green-400">{user?.email}</p>
                  {isAdmin && (
                    <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue={isAdmin ? "admin" : "overview"} className="space-y-6">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-9 gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center space-x-2 text-xs lg:text-sm">
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline">Admin</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="overview" className="flex items-center space-x-2 text-xs lg:text-sm">
                <Home className="w-4 h-4" />
                <span className="hidden lg:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2 text-xs lg:text-sm">
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="irrigation" className="flex items-center space-x-2 text-xs lg:text-sm">
                <Droplets className="w-4 h-4" />
                <span className="hidden lg:inline">Irrigation</span>
              </TabsTrigger>
              <TabsTrigger value="sensors" className="flex items-center space-x-2 text-xs lg:text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden lg:inline">Sensors</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center space-x-2 text-xs lg:text-sm">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden lg:inline">Shop</span>
              </TabsTrigger>
              <TabsTrigger value="weather" className="flex items-center space-x-2 text-xs lg:text-sm">
                <Cloud className="w-4 h-4" />
                <span className="hidden lg:inline">Weather</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center space-x-2 text-xs lg:text-sm">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden lg:inline">Support</span>
              </TabsTrigger>
              <TabsTrigger value="otp" className="flex items-center space-x-2 text-xs lg:text-sm">
                <Phone className="w-4 h-4" />
                <span className="hidden lg:inline">Reports</span>
              </TabsTrigger>
            </TabsList>

            {isAdmin && (
              <TabsContent value="admin" className="space-y-6">
                <AdminDashboard />
              </TabsContent>
            )}

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EnhancedIrrigationCycle user={user} />
                </div>
                <div>
                  <WeatherWidget />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SensorMonitoring user={user} />
                <VendorMarketplace user={user} />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileManagement user={user} />
            </TabsContent>

            <TabsContent value="irrigation" className="space-y-6">
              <EnhancedIrrigationCycle user={user} />
            </TabsContent>

            <TabsContent value="sensors" className="space-y-6">
              <SensorMonitoring user={user} />
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-6">
              <VendorMarketplace user={user} />
            </TabsContent>

            <TabsContent value="weather" className="space-y-6">
              <WeatherWidget />
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <CustomerSupport user={user} />
            </TabsContent>

            <TabsContent value="otp" className="space-y-6">
              <OTPManager user={user} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="bg-green-800/90 dark:bg-green-900/90 backdrop-blur-sm text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">🌱 AgriSmart</h3>
                <p className="text-green-200">
                  Empowering farmers with smart technology for sustainable agriculture and improved crop yields.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-green-200">
                  <li>• Irrigation Management</li>
                  <li>• Sensor Monitoring</li>
                  <li>• Weather Forecasting</li>
                  <li>• Vendor Marketplace</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-green-200">
                  <li>📞 +254 700 000 000</li>
                  <li>📧 support@agrismart.co.ke</li>
                  <li>🕐 24/7 Customer Support</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200">
              <p>&copy; 2024 AgriSmart. All rights reserved. Made with ❤️ for Kenyan farmers.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
