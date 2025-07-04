
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  MapPin, 
  Droplets, 
  TrendingUp, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
  Settings,
  Download,
  Mail,
  MessageSquare,
  BarChart3,
  Wheat,
  Tractor,
  LogOut,
  Shield,
  Bot,
  Leaf,
  Bell
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import IrrigationCycle from '../components/IrrigationCycle';
import EnhancedIrrigationCycle from '../components/EnhancedIrrigationCycle';
import SensorMonitoring from '../components/SensorMonitoring';
import RealSensorMonitoring from '../components/RealSensorMonitoring';
import SensorRegistration from '../components/SensorRegistration';
import WeatherDashboard from '../components/WeatherDashboard';
import WeatherWidget from '../components/WeatherWidget';
import VendorMarketplace from '../components/VendorMarketplace';
import PayPalCheckout from '../components/PayPalCheckout';
import CustomerSupport from '../components/CustomerSupport';
import ProfileManagement from '../components/ProfileManagement';
import UserAIAssistant from '../components/UserAIAssistant';
import ReportGenerator from '../components/ReportGenerator';
import EnhancedFarmDashboard from '../components/EnhancedFarmDashboard';
import LoadingSpinner from '../components/LoadingSpinner';
import NotificationCenter from '../components/NotificationCenter';
import ErrorBoundary from '../components/ErrorBoundary';
import { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const [
          { count: totalIrrigationLogs },
          { count: totalSensorData },
          { count: totalSupportTickets },
          { data: recentLogs }
        ] = await Promise.all([
          supabase.from('irrigation_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('sensor_data').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('irrigation_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
        ]);

        return {
          totalIrrigationLogs: totalIrrigationLogs || 0,
          totalSensorData: totalSensorData || 0,
          totalSupportTickets: totalSupportTickets || 0,
          recentLogs: recentLogs || []
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "👋 Logged Out Successfully",
        description: "Thank you for using AgriSmart. See you soon!",
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
    toast({
      title: showAIAssistant ? "🤖 AI Assistant Disabled" : "🌱 AI Assistant Activated",
      description: showAIAssistant ? "AI assistant is now hidden" : "Your farming AI assistant is ready to help!",
    });
  };

  const handleSensorUpdate = () => {
    // This will trigger re-fetch in RealSensorMonitoring
    window.location.reload();
  };

  if (statsError) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="text-center p-8">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
              <p className="text-gray-600 mb-4">
                Unable to load dashboard data. Please check your connection and try again.
              </p>
              <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
                Reload Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  if (!user || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <LoadingSpinner 
          size="lg" 
          message="Loading your AgriSmart dashboard..." 
          variant="agricultural"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 pb-20 bg-gradient-to-br from-green-50/30 to-blue-50/30 dark:from-green-950/30 dark:to-blue-950/30 min-h-screen">
        {/* Enhanced Header with AI Assistant Toggle */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-green-800 sticky top-0 z-40">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Leaf className="w-10 h-10 text-green-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-800 dark:text-green-400">AgriSmart Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-300">Smart Farming Made Simple</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter user={user} />
              
              <Button 
                onClick={toggleAIAssistant}
                className={`${
                  showAIAssistant 
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                } transition-all duration-300`}
              >
                <Bot className="w-4 h-4 mr-2" />
                {showAIAssistant ? 'AI Active' : 'Activate AI'}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Welcome, {user.email?.split('@')[0]}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    Online • Last active: now
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Enhanced Farm Dashboard */}
          <div className="mb-8">
            <EnhancedFarmDashboard user={user} />
          </div>

          {/* Weather Widget */}
          <div className="mb-8">
            <WeatherWidget user={user} />
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="irrigation" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-green-200 dark:border-green-800 p-1">
              <TabsTrigger value="irrigation" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                <Droplets className="w-4 h-4 mr-2" />
                Irrigation
              </TabsTrigger>
              <TabsTrigger value="sensors" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                <Activity className="w-4 h-4 mr-2" />
                Sensors
              </TabsTrigger>
              <TabsTrigger value="weather" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                <Globe className="w-4 h-4 mr-2" />
                Weather
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800">
                <Wheat className="w-4 h-4 mr-2" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                <MessageSquare className="w-4 h-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800">
                <Users className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="irrigation" className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-green-200 dark:border-green-800">
                <EnhancedIrrigationCycle user={user} />
              </div>
            </TabsContent>

            <TabsContent value="sensors" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <SensorRegistration user={user} onSensorUpdate={handleSensorUpdate} />
                </div>
                <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <RealSensorMonitoring user={user} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weather" className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <WeatherDashboard />
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                <ReportGenerator user={user} />
              </div>
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
                <VendorMarketplace user={user} />
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-200 dark:border-red-800">
                <CustomerSupport user={user} />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                <ProfileManagement user={user} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced AI Assistant */}
        {showAIAssistant && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border-2 border-green-300 dark:border-green-700 max-w-sm">
              <div className="p-4 border-b border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800 dark:text-green-300">AI Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAIAssistant}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="max-h-96 overflow-hidden">
                <UserAIAssistant />
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
