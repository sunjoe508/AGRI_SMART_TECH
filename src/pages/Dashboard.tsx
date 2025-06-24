
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Sprout, 
  Settings, 
  Cloud, 
  Phone, 
  MessageSquare, 
  BarChart3, 
  Droplets,
  User,
  MapPin,
  Bell,
  LogOut
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import IrrigationCycle from "@/components/IrrigationCycle";
import ProfileManagement from "@/components/ProfileManagement";
import WeatherDashboard from "@/components/WeatherDashboard";
import SensorMonitoring from "@/components/SensorMonitoring";
import OTPManager from "@/components/OTPManager";
import CustomerSupport from "@/components/CustomerSupport";

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "👋 Goodbye!",
        description: "Successfully logged out of AgriSmart",
      });
    } catch (error: any) {
      toast({
        title: "❌ Logout Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-800">AgriSmart Kenya</h1>
                <p className="text-sm text-gray-600">Smart Irrigation Dashboard</p>
              </div>
            </div>
            <Badge className="bg-green-500">🇰🇪 Kenya</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {user?.user_metadata?.county || 'Kenya'}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="irrigation"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Irrigation</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weather"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="otp"
              className="flex items-center space-x-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">OTP</span>
            </TabsTrigger>
            <TabsTrigger 
              value="support"
              className="flex items-center space-x-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sensors"
              className="flex items-center space-x-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Sensors</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Zones</p>
                      <p className="text-3xl font-bold">4</p>
                      <p className="text-sm text-green-100">Irrigation running</p>
                    </div>
                    <Droplets className="w-12 h-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Water Saved</p>
                      <p className="text-3xl font-bold">1,240L</p>
                      <p className="text-sm text-blue-100">This week</p>
                    </div>
                    <Cloud className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Temperature</p>
                      <p className="text-3xl font-bold">28°C</p>
                      <p className="text-sm text-orange-100">Current</p>
                    </div>
                    <MapPin className="w-12 h-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Alerts Sent</p>
                      <p className="text-3xl font-bold">12</p>
                      <p className="text-sm text-purple-100">This month</p>
                    </div>
                    <Bell className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <IrrigationCycle />
          </TabsContent>

          <TabsContent value="irrigation">
            <IrrigationCycle />
          </TabsContent>

          <TabsContent value="weather">
            <WeatherDashboard />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement user={user} />
          </TabsContent>

          <TabsContent value="otp">
            <OTPManager user={user} />
          </TabsContent>

          <TabsContent value="support">
            <CustomerSupport user={user} />
          </TabsContent>

          <TabsContent value="sensors">
            <SensorMonitoring user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
