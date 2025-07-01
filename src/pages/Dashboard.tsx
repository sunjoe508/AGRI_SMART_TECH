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
  Leaf
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

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate('/login');
        return;
      }
      setUser(user);
    };

    checkUser();
  }, [navigate]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
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
    },
    enabled: !!user?.id,
    refetchInterval: 30000
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
    toast({
      title: showAIAssistant ? "🤖 AI Assistant Disabled" : "🌱 AI Assistant Activated",
      description: showAIAssistant ? "AI assistant is now hidden" : "Your farming AI assistant is ready to help!",
    });
  };

  if (!user || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading your AgriSmart dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header with AI Assistant Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Leaf className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-3xl font-bold text-green-800 dark:text-green-400">AgriSmart Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">Smart Farming Made Simple</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={toggleAIAssistant}
            className={`${
              showAIAssistant 
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <Bot className="w-4 h-4 mr-2" />
            {showAIAssistant ? 'AI Active' : 'Activate AI'}
          </Button>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Welcome, {user.email}
          </Badge>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Droplets className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Irrigation Sessions</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-400">{stats?.totalIrrigationLogs}</p>
                <p className="text-xs text-green-600">Total completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sensor Readings</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{stats?.totalSensorData}</p>
                <p className="text-xs text-blue-600">Data points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Support Tickets</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-400">{stats?.totalSupportTickets}</p>
                <p className="text-xs text-purple-600">Active requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Wheat className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Farm Health</p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-400">95%</p>
                <p className="text-xs text-orange-600">Overall score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="irrigation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="irrigation" className="space-y-6">
          <EnhancedIrrigationCycle />
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SensorRegistration />
            <RealSensorMonitoring />
          </div>
        </TabsContent>

        <TabsContent value="weather" className="space-y-6">
          <WeatherDashboard />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <VendorMarketplace />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <CustomerSupport />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <ProfileManagement />
        </TabsContent>
      </Tabs>

      {/* AI Assistant */}
      {showAIAssistant && <UserAIAssistant />}
    </div>
  );
};

export default Dashboard;
