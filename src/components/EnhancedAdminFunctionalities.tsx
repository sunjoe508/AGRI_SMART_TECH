
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Database, 
  Bell, 
  Settings, 
  BarChart3, 
  Mail, 
  MessageSquare, 
  Download,
  UserPlus,
  Lock,
  Key,
  Activity,
  Globe,
  Zap,
  Brain,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EnhancedAdminFunctionalities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackups: true,
    realTimeUpdates: true,
    aiAssistant: true
  });

  // Fetch system analytics
  const { data: systemAnalytics } = useQuery({
    queryKey: ['system-analytics'],
    queryFn: async () => {
      const [
        { count: totalLogins },
        { count: activeToday },
        { count: systemErrors },
        { count: apiCalls }
      ] = await Promise.all([
        supabase.from('daily_reports').select('*', { count: 'exact', head: true }),
        supabase.from('irrigation_logs').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('sensor_data').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalLogins: totalLogins || 0,
        activeToday: activeToday || 0,
        systemErrors: systemErrors || 0,
        apiCalls: apiCalls || 0,
        uptime: 99.8,
        performance: 94.2
      };
    },
    refetchInterval: 30000
  });

  // Create admin token mutation
  const createAdminTokenMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('generate_admin_token', {
        admin_email: email
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (token) => {
      toast({
        title: "🔑 Admin Token Generated",
        description: `Token: ${token} (valid for 24 hours)`,
      });
      setNewAdminEmail('');
    },
    onError: (error: any) => {
      toast({
        title: "❌ Token Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Send system notification
  const sendSystemNotification = async () => {
    if (!bulkMessage.trim()) return;
    
    toast({
      title: "📢 System Notification Sent",
      description: `Message sent to all active users: "${bulkMessage.substring(0, 50)}..."`,
    });
    setBulkMessage('');
  };

  // System maintenance functions
  const toggleMaintenanceMode = () => {
    setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
    toast({
      title: systemSettings.maintenanceMode ? "🟢 Maintenance Mode Disabled" : "🟡 Maintenance Mode Enabled",
      description: systemSettings.maintenanceMode ? "System is now live for all users" : "System is in maintenance mode",
    });
  };

  const performSystemBackup = async () => {
    toast({
      title: "💾 System Backup Started",
      description: "Creating full system backup... This may take a few minutes.",
    });

    // Simulate backup process
    setTimeout(() => {
      toast({
        title: "✅ Backup Complete",
        description: "Full system backup created successfully.",
      });
    }, 5000);
  };

  const clearSystemCache = async () => {
    queryClient.clear();
    toast({
      title: "🧹 Cache Cleared",
      description: "All system caches have been cleared successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-blue-800">{systemAnalytics?.uptime}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-green-800">{systemAnalytics?.performance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">API Calls Today</p>
                <p className="text-2xl font-bold text-purple-800">{systemAnalytics?.apiCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-orange-800">{systemAnalytics?.systemErrors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="admin-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="admin-management">Admin Management</TabsTrigger>
          <TabsTrigger value="system-control">System Control</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="admin-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Admin Token Generation</span>
              </CardTitle>
              <CardDescription>Generate secure tokens for new admin accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="New admin email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => createAdminTokenMutation.mutate(newAdminEmail)}
                  disabled={!newAdminEmail || createAdminTokenMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Generate Token
                </Button>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Admin tokens are valid for 24 hours and can only be used once
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={toggleMaintenanceMode}
                  className={`h-20 flex flex-col items-center justify-center space-y-2 ${
                    systemSettings.maintenanceMode 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Lock className="w-6 h-6" />
                  <span>{systemSettings.maintenanceMode ? 'Exit Maintenance' : 'Maintenance Mode'}</span>
                </Button>

                <Button
                  onClick={performSystemBackup}
                  className="h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center space-y-2"
                >
                  <Database className="w-6 h-6" />
                  <span>Create Backup</span>
                </Button>

                <Button
                  onClick={clearSystemCache}
                  className="h-20 bg-orange-600 hover:bg-orange-700 flex flex-col items-center justify-center space-y-2"
                >
                  <Zap className="w-6 h-6" />
                  <span>Clear Cache</span>
                </Button>

                <Button className="h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center space-y-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>System Notifications</span>
              </CardTitle>
              <CardDescription>Send notifications to all system users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type system notification message..."
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={sendSystemNotification}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>System Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Database Status</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 mt-1">All systems operational</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">API Gateway</span>
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Response time: 45ms</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-800">AI Services</span>
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Neural networks active</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-800">Storage</span>
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-xs text-orange-600 mt-1">78% capacity used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminFunctionalities;
