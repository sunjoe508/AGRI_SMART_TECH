
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Droplets,
  Thermometer,
  User,
  LogOut,
  Bell,
  Settings,
  Activity,
  FileText,
  Smartphone,
  TestTube
} from 'lucide-react';

// Import components
import ProfileManagement from "@/components/ProfileManagement";
import SensorMonitoring from "@/components/SensorMonitoring";
import RealSensorMonitoring from "@/components/RealSensorMonitoring";
import SensorRegistration from "@/components/SensorRegistration";
import IrrigationCycle from "@/components/IrrigationCycle";
import WeatherWidget from "@/components/WeatherWidget";
import ReportGenerator from "@/components/ReportGenerator";
import NotificationCenter from "@/components/NotificationCenter";
import MobileAppGuide from "@/components/MobileAppGuide";
import SensorTestingPanel from "@/components/SensorTestingPanel";

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch user profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  // Handle sensor updates - this will refresh data across components
  const handleSensorUpdate = () => {
    // Trigger data refresh for sensor-related components
    refetchProfile();
    // Force a page refresh if needed for real-time updates
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Handle data generation from testing panel
  const handleDataGenerated = () => {
    // Refresh all sensor data when test data is generated
    handleSensorUpdate();
    toast({
      title: "📊 Data Updated",
      description: "Sensor data has been refreshed across all components",
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "👋 Logged out successfully",
        description: "See you soon!",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 dark:text-green-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-800 dark:text-green-200">
                  AgriSmart Dashboard
                </h1>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Welcome back, {profile?.full_name || 'Farmer'}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter user={user} />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="sensors" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Sensors</span>
            </TabsTrigger>
            <TabsTrigger value="irrigation" className="flex items-center space-x-2">
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Irrigation</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile App</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center space-x-2">
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">Testing</span>
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SensorMonitoring user={user} />
                <IrrigationCycle />
              </div>
              <div className="space-y-6">
                <WeatherWidget />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Quick Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Farm Size:</span>
                        <Badge variant="secondary">
                          {profile?.farm_size_acres || 0} acres
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm font-medium">
                          {profile?.county || 'Kenya'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Crops:</span>
                        <span className="text-sm font-medium">
                          {profile?.crop_types?.length || 0} types
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sensors Tab */}
          <TabsContent value="sensors">
            <Tabs defaultValue="monitoring" className="space-y-6">
              <TabsList className="bg-white/70 dark:bg-gray-800/70">
                <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
                <TabsTrigger value="registration">Registration</TabsTrigger>
                <TabsTrigger value="testing">Testing Panel</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monitoring">
                <RealSensorMonitoring user={user} />
              </TabsContent>
              
              <TabsContent value="registration">
                <SensorRegistration user={user} onSensorUpdate={handleSensorUpdate} />
              </TabsContent>
              
              <TabsContent value="testing">
                <SensorTestingPanel user={user} onDataGenerated={handleDataGenerated} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Irrigation Tab */}
          <TabsContent value="irrigation">
            <IrrigationCycle />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportGenerator user={user} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileManagement user={user} />
          </TabsContent>

          {/* Mobile App Tab */}
          <TabsContent value="mobile">
            <MobileAppGuide />
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing">
            <SensorTestingPanel user={user} onDataGenerated={handleDataGenerated} />
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherWidget />
              <Card>
                <CardHeader>
                  <CardTitle>Weather Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Weather data helps optimize your irrigation and farming decisions.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>• Real-time weather conditions</div>
                    <div>• 5-day weather forecast</div>
                    <div>• Rainfall predictions</div>
                    <div>• Temperature monitoring</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
