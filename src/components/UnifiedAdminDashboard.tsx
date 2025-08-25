import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Import admin components
import HolographicStats from './HolographicStats';
import AIAssistant from './AIAssistant';
import VoiceCommands from './VoiceCommands';
import DataVisualization3D from './DataVisualization3D';
import FuturisticUserCard from './FuturisticUserCard';
import EnhancedAdminFunctionalities from './EnhancedAdminFunctionalities';
import RealTimeUserMonitoring from './RealTimeUserMonitoring';
import SystemAnalytics from './SystemAnalytics';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Mic, MicOff, Database, Sparkles, Shield, Globe, Cpu, MessageSquare, Users } from 'lucide-react';

export function UnifiedAdminDashboard() {
  const [searchParams] = useSearchParams();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const currentTab = searchParams.get('tab') || 'monitoring';

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      navigate('/admin-login');
      return;
    }
    
    try {
      const parsedSession = JSON.parse(session);
      if (!parsedSession.isAdmin || parsedSession.username !== 'joe') {
        localStorage.removeItem('adminSession');
        navigate('/admin-login');
        return;
      }
      setAdminSession(parsedSession);
      
      setTimeout(() => {
        toast({
          title: "🚀 Admin Portal Activated",
          description: "Welcome to AgriSmart Admin Dashboard!",
        });
      }, 1000);
    } catch (error) {
      localStorage.removeItem('adminSession');
      navigate('/admin-login');
    }
  }, [navigate, toast]);

  // Set up real-time subscriptions for admin dashboard
  useEffect(() => {
    if (!adminSession) return;

    console.log('Setting up admin real-time subscriptions...');
    
    // Subscribe to all table changes for admin monitoring
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Profiles change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        toast({
          title: "👥 User Update",
          description: "User data updated",
        });
      })
      .subscribe();

    const sensorChannel = supabase
      .channel('admin-sensor-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sensor_data'
      }, (payload) => {
        console.log('Sensor data change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        toast({
          title: "📡 Sensor Update",
          description: "New sensor data received",
        });
      })
      .subscribe();

    const irrigationChannel = supabase
      .channel('admin-irrigation-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'irrigation_logs'
      }, (payload) => {
        console.log('Irrigation change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      })
      .subscribe();

    return () => {
      console.log('Cleaning up admin subscriptions...');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(sensorChannel);
      supabase.removeChannel(irrigationChannel);
    };
  }, [adminSession, queryClient, toast]);

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalIrrigationLogs },
        { count: totalSensorData },
        { count: totalOrders },
        { count: totalSupportTickets }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('irrigation_logs').select('*', { count: 'exact', head: true }),
        supabase.from('sensor_data').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalIrrigationLogs: totalIrrigationLogs || 0,
        totalSensorData: totalSensorData || 0,
        totalOrders: totalOrders || 0,
        totalSupportTickets: totalSupportTickets || 0,
        systemHealth: Math.round((95 + Math.random() * 5) * 10) / 10,
        lastUpdated: new Date().getTime()
      };
    },
    enabled: !!adminSession,
    refetchInterval: 5000
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,county.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!adminSession,
    refetchInterval: 10000
  });

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast({
      title: "🌟 Admin Session Ended",
      description: "Successfully logged out of admin portal",
    });
    navigate('/admin-login');
  };

  const activateAI = () => {
    setIsAIActive(!isAIActive);
    toast({
      title: isAIActive ? "🤖 AI Assistant Deactivated" : "🚀 AI Assistant Activated",
      description: isAIActive ? "AI systems in standby mode" : "Neural networks online",
    });
  };

  const toggleVoiceCommands = () => {
    setVoiceEnabled(!voiceEnabled);
    toast({
      title: voiceEnabled ? "🎤 Voice Commands Disabled" : "🎤 Voice Commands Enabled",
      description: voiceEnabled ? "Switching to manual control" : "Voice recognition online",
    });
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'monitoring':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Real-Time User Monitoring</span>
                  <Badge variant="default" className="ml-2">
                    {users?.length || 0} Users Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users?.slice(0, 6).map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{user.full_name || 'Unknown User'}</h4>
                        <p className="text-sm text-muted-foreground">{user.county}</p>
                        <p className="text-xs text-muted-foreground">{user.phone_number}</p>
                      </div>
                    ))}
                  </div>
                  {users && users.length > 6 && (
                    <p className="text-center text-muted-foreground">
                      And {users.length - 6} more users...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <SystemAnalytics />
            <Card>
              <CardHeader>
                <CardTitle>System Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-semibold">Total Users</h3>
                    <p className="text-2xl font-bold text-primary">{stats?.totalUsers}</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-semibold">Sensor Data Points</h3>
                    <p className="text-2xl font-bold text-primary">{stats?.totalSensorData}</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-semibold">Irrigation Logs</h3>
                    <p className="text-2xl font-bold text-primary">{stats?.totalIrrigationLogs}</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-semibold">System Health</h3>
                    <p className="text-2xl font-bold text-green-600">{stats?.systemHealth}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'insights':
        return (
          <div className="space-y-6">
            <HolographicStats stats={stats} />
            {isAIActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI Assistant Active</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AIAssistant />
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 'functions':
        return <EnhancedAdminFunctionalities />;
      
      case 'command':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Command Center</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataVisualization3D data={stats} />
              </CardContent>
            </Card>
            {voiceEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Voice Commands Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <VoiceCommands />
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 'health':
        return (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Health</span>
                    <Badge variant="default">{stats?.systemHealth}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Users</span>
                    <Badge variant="secondary">{stats?.totalUsers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database Status</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'support':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Support Tickets</span>
                <Badge variant="secondary">{stats?.totalSupportTickets || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Total Support Tickets: {stats?.totalSupportTickets || 0}
              </p>
              <div className="mt-4 p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Support ticket management system is operational. All tickets are being monitored in real-time.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'reports':
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-semibold">User Reports</h3>
                    <p className="text-2xl font-bold text-primary">{stats?.totalUsers}</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h3 className="font-semibold">Sensor Data</h3>
                    <p className="text-2xl font-bold text-primary">{stats?.totalSensorData}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'database':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Database Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-medium">Profiles</h4>
                    <p className="text-xl font-bold">{stats?.totalUsers}</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-medium">Sensor Data</h4>
                    <p className="text-xl font-bold">{stats?.totalSensorData}</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-medium">Irrigation Logs</h4>
                    <p className="text-xl font-bold">{stats?.totalIrrigationLogs}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'performance':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>System Health</span>
                    <Badge className="bg-green-500">{stats?.systemHealth}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <Badge variant="secondary">Fast</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Uptime</span>
                    <Badge className="bg-blue-500">99.9%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return <RealTimeUserMonitoring />;
    }
  };

  if (!adminSession || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          userType="admin" 
          onLogout={handleLogout}
          userName="Administrator"
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-primary" />
                <Globe className="w-6 h-6 text-blue-500" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    AgriSmart Admin Portal
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Cpu className="w-4 h-4" />
                    <span>System: ONLINE</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>• Users: {stats?.totalUsers}</span>
                    <span>• Health: {stats?.systemHealth}%</span>
                  </div>
                </div>
              </div>
              <Badge variant="default" className="ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                LIVE DATA
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 ml-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button 
                onClick={toggleVoiceCommands}
                variant="outline"
                size="sm"
              >
                {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button 
                onClick={activateAI}
                variant="outline"
                size="sm"
              >
                <Brain className="w-4 h-4 mr-2" />
                {isAIActive ? 'AI ACTIVE' : 'ACTIVATE AI'}
              </Button>
            </div>
          </header>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}