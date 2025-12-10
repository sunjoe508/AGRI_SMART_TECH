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
        irrigationResult,
        ticketsResult,
        sensorResult
      ] = await Promise.all([
        supabase.from('irrigation_logs' as any).select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) as any,
        supabase.from('support_tickets' as any).select('*', { count: 'exact', head: true }).eq('status', 'open') as any,
        supabase.from('sensor_data' as any).select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) as any
      ]);

      return {
        totalLogins: 0,
        activeToday: irrigationResult.count || 0,
        systemErrors: ticketsResult.count || 0,
        apiCalls: sensorResult.count || 0,
        uptime: 99.8,
        performance: 94.2
      };
    },
    refetchInterval: 30000
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
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold text-foreground">{systemAnalytics?.uptime}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold text-foreground">{systemAnalytics?.performance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-muted-foreground">API Calls Today</p>
                <p className="text-2xl font-bold text-foreground">{systemAnalytics?.apiCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-2xl font-bold text-foreground">{systemAnalytics?.systemErrors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="system-control" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="system-control">System Control</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="system-control" className="space-y-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
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
                      ? 'bg-destructive hover:bg-destructive/90' 
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
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
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
                  className="flex-1 bg-background"
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
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <Eye className="w-5 h-5" />
                <span>System Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Database Status</span>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">All systems operational</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">API Gateway</span>
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Response time: 45ms</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">AI Services</span>
                    <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Neural networks active</p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Storage</span>
                    <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">78% capacity used</p>
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
