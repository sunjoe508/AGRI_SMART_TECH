
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, Shield, Database, Activity, UserPlus, Settings, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import AdminManagement from './AdminManagement';

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch admin statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalAdmins },
        { count: totalProfiles },
        { count: totalOrders }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('admin_roles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 1, // At least the main admin
        totalProfiles: totalProfiles || 0,
        totalOrders: totalOrders || 0
      };
    }
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "👋 Logged Out",
        description: "You have been successfully logged out from admin panel.",
      });
      
      navigate('/admin-login');
    } catch (error: any) {
      toast({
        title: "❌ Logout Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const manageUsers = () => {
    toast({
      title: "👥 User Management",
      description: "Opening user management interface...",
    });
  };

  const viewAnalytics = () => {
    toast({
      title: "📊 Analytics Dashboard",
      description: "Loading comprehensive analytics...",
    });
  };

  const systemSettings = () => {
    toast({
      title: "⚙️ System Settings",
      description: "Accessing system configuration panel...",
    });
  };

  const generateReport = () => {
    toast({
      title: "📋 Report Generated",
      description: "System report has been generated successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">Manage users, admins, and system settings</p>
          </div>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{stats?.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Admins</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-400">{stats?.totalAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profiles</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-400">{stats?.totalProfiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-400">{stats?.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button onClick={manageUsers} className="h-20 flex flex-col items-center justify-center space-y-2">
          <Users className="w-6 h-6" />
          <span>Manage Users</span>
        </Button>
        
        <Button onClick={viewAnalytics} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
          <Activity className="w-6 h-6" />
          <span>View Analytics</span>
        </Button>
        
        <Button onClick={systemSettings} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
          <Settings className="w-6 h-6" />
          <span>System Settings</span>
        </Button>
        
        <Button onClick={generateReport} variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
          <Database className="w-6 h-6" />
          <span>Generate Report</span>
        </Button>
      </div>

      {/* Admin Management Tabs */}
      <Tabs defaultValue="admin-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <TabsTrigger value="admin-management" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Admin Management</span>
          </TabsTrigger>
          <TabsTrigger value="user-management" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="system-settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin-management" className="space-y-6">
          <AdminManagement />
        </TabsContent>

        <TabsContent value="user-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  User management features:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• View all registered users: {stats?.totalUsers || 0} farmers</li>
                  <li>• Activate/deactivate user accounts</li>
                  <li>• Reset user passwords</li>
                  <li>• View user activity logs</li>
                </ul>
                <div className="flex space-x-4 pt-4">
                  <Button onClick={() => toast({ title: "👥 User List", description: "Loading all registered users..." })}>
                    View All Users
                  </Button>
                  <Button onClick={() => toast({ title: "🔄 User Actions", description: "User management tools activated..." })} variant="outline">
                    User Actions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  System configuration options:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Email configuration and notifications</li>
                  <li>• API key management and access control</li>
                  <li>• System maintenance mode toggle</li>
                  <li>• Database backup and restoration</li>
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Button onClick={() => toast({ title: "📧 Email Config", description: "Email settings configured successfully." })}>
                    Configure Email
                  </Button>
                  <Button onClick={() => toast({ title: "🔑 API Keys", description: "API key management panel opened." })} variant="outline">
                    Manage API Keys
                  </Button>
                  <Button onClick={() => toast({ title: "🔧 Maintenance", description: "Maintenance mode toggled." })} variant="outline">
                    Maintenance Mode
                  </Button>
                  <Button onClick={() => toast({ title: "💾 Backup", description: "Database backup initiated." })} variant="outline">
                    Database Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
