
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
import ReportGenerator from '../components/ReportGenerator';
import EnhancedFarmDashboard from '../components/EnhancedFarmDashboard';
import { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleSensorUpdate = () => {
    // This will trigger re-fetch in RealSensorMonitoring
    window.location.reload();
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

      {/* Enhanced Farm Dashboard */}
      <EnhancedFarmDashboard user={user} />

      {/* Weather Widget */}
      <WeatherWidget user={user} />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="irrigation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="irrigation" className="space-y-6">
          <EnhancedIrrigationCycle user={user} />
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SensorRegistration user={user} onSensorUpdate={handleSensorUpdate} />
            <RealSensorMonitoring user={user} />
          </div>
        </TabsContent>

        <TabsContent value="weather" className="space-y-6">
          <WeatherDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportGenerator user={user} />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <VendorMarketplace user={user} />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <CustomerSupport user={user} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <ProfileManagement user={user} />
        </TabsContent>
      </Tabs>

      {/* AI Assistant */}
      {showAIAssistant && <UserAIAssistant />}
    </div>
  );
};

export default Dashboard;
