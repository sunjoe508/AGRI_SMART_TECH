import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  UserCheck, 
  UserX, 
  MapPin, 
  Phone, 
  Mail, 
  Activity, 
  Eye, 
  Trash2, 
  Edit, 
  Search,
  Filter,
  Download,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  full_name?: string;
  phone_number?: string;
  county?: string;
  sub_county?: string;
  ward?: string;
  farm_name?: string;
  farm_size_acres?: number;
  crop_types?: string[];
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserActivity {
  user_id: string;
  last_login?: string;
  irrigation_count: number;
  sensor_count: number;
  support_tickets: number;
  orders_count: number;
  status: 'active' | 'inactive' | 'new';
}

const RealTimeUserMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<{ [key: string]: UserActivity }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up real-time subscriptions for user monitoring
  useEffect(() => {
    console.log('Setting up real-time user monitoring...');
    
    // Subscribe to auth events (user logins/logouts)
    const authChannel = supabase
      .channel('auth-events')
      .on('postgres_changes', {
        event: '*',
        schema: 'auth',
        table: 'users'
      }, (payload) => {
        console.log('Auth event detected:', payload);
        toast({
          title: "🔄 User Activity",
          description: "Real-time user authentication event detected",
        });
        queryClient.invalidateQueries({ queryKey: ['real-time-users'] });
      })
      .subscribe();

    // Subscribe to profile changes
    const profilesChannel = supabase
      .channel('profiles-monitoring')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Profile change detected:', payload);
        if (payload.eventType === 'INSERT') {
          toast({
            title: "👋 New User Registered",
            description: `${payload.new.full_name || 'New farmer'} joined from ${payload.new.county || 'Kenya'}`,
          });
        }
        queryClient.invalidateQueries({ queryKey: ['real-time-users'] });
        queryClient.invalidateQueries({ queryKey: ['user-activities'] });
      })
      .subscribe();

    // Subscribe to irrigation logs for activity tracking
    const irrigationChannel = supabase
      .channel('irrigation-monitoring')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'irrigation_logs'
      }, (payload) => {
        console.log('New irrigation activity:', payload);
        toast({
          title: "💧 Irrigation Activity",
          description: "Farmer initiated new irrigation cycle",
        });
        queryClient.invalidateQueries({ queryKey: ['user-activities'] });
      })
      .subscribe();

    // Subscribe to sensor data for activity tracking
    const sensorChannel = supabase
      .channel('sensor-monitoring')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_data'
      }, (payload) => {
        console.log('New sensor data:', payload);
        queryClient.invalidateQueries({ queryKey: ['user-activities'] });
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time user monitoring...');
      supabase.removeChannel(authChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(irrigationChannel);
      supabase.removeChannel(sensorChannel);
    };
  }, [toast, queryClient]);

  // Fetch users with real-time updates
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['real-time-users', searchTerm, selectedCounty],
    queryFn: async () => {
      console.log('Fetching users with real-time monitoring...');
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%,farm_name.ilike.%${searchTerm}%`);
      }

      // Apply county filter
      if (selectedCounty) {
        query = query.eq('county', selectedCounty);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} users with filters`);
      return data as User[];
    },
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Fetch user activities
  const { data: activities } = useQuery({
    queryKey: ['user-activities'],
    queryFn: async () => {
      if (!users || users.length === 0) return {};

      console.log('Fetching user activities...');
      const userIds = users.map(user => user.id);
      
      // Get irrigation counts
      const { data: irrigationData } = await supabase
        .from('irrigation_logs')
        .select('user_id')
        .in('user_id', userIds);

      // Get sensor data counts
      const { data: sensorData } = await supabase
        .from('sensor_data')
        .select('user_id')
        .in('user_id', userIds);

      // Get support ticket counts
      const { data: supportData } = await supabase
        .from('support_tickets')
        .select('user_id')
        .in('user_id', userIds);

      // Get order counts
      const { data: ordersData } = await supabase
        .from('orders')
        .select('user_id')
        .in('user_id', userIds);

      // Calculate activities for each user
      const activities: { [key: string]: UserActivity } = {};
      
      users.forEach(user => {
        const irrigationCount = irrigationData?.filter(log => log.user_id === user.id).length || 0;
        const sensorCount = sensorData?.filter(sensor => sensor.user_id === user.id).length || 0;
        const supportTickets = supportData?.filter(ticket => ticket.user_id === user.id).length || 0;
        const ordersCount = ordersData?.filter(order => order.user_id === user.id).length || 0;
        
        // Determine user status based on activity
        let status: 'active' | 'inactive' | 'new' = 'new';
        const createdDate = new Date(user.created_at);
        const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreated > 7) {
          status = (irrigationCount > 0 || sensorCount > 0) ? 'active' : 'inactive';
        }

        activities[user.id] = {
          user_id: user.id,
          irrigation_count: irrigationCount,
          sensor_count: sensorCount,
          support_tickets: supportTickets,
          orders_count: ordersCount,
          status
        };
      });

      setUserActivities(activities);
      console.log('User activities calculated:', Object.keys(activities).length);
      return activities;
    },
    enabled: !!users && users.length > 0,
    refetchInterval: 10000, // Update activities every 10 seconds
  });

  // Get unique counties for filtering
  const counties = [...new Set(users?.map(user => user.county).filter(Boolean))] as string[];

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      
      // Delete related data first (cascade delete)
      await Promise.all([
        supabase.from('irrigation_logs').delete().eq('user_id', userId),
        supabase.from('sensor_data').delete().eq('user_id', userId),
        supabase.from('support_tickets').delete().eq('user_id', userId),
        supabase.from('orders').delete().eq('user_id', userId),
        (supabase as any).from('registered_sensors').delete().eq('user_id', userId),
        (supabase as any).from('daily_reports').delete().eq('user_id', userId),
        (supabase as any).from('otp_messages').delete().eq('user_id', userId)
      ]);

      // Finally delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ User Deleted",
        description: "User and all associated data have been permanently removed.",
      });
      refetchUsers();
      queryClient.invalidateQueries({ queryKey: ['user-activities'] });
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      toast({
        title: "❌ Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Export users data
  const exportUsers = async () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalUsers: users?.length || 0,
        users: users?.map(user => ({
          ...user,
          activity: userActivities[user.id]
        }))
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agrismart-users-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "📊 Export Complete",
        description: `Exported ${users?.length || 0} user records with activity data`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800"><TrendingUp className="w-3 h-3 mr-1" />New</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading real-time user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Real-Time User Monitoring</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <Activity className="w-3 h-3 mr-1" />
                {users?.length || 0} Total Users
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Globe className="w-3 h-3 mr-1" />
                {counties.length} Counties
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Monitor user registrations, activity, and engagement in real-time across Kenya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {users?.filter(u => userActivities[u.id]?.status === 'active').length || 0}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {users?.filter(u => userActivities[u.id]?.status === 'new').length || 0}
              </div>
              <div className="text-sm text-gray-600">New Users</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">
                {users?.filter(u => userActivities[u.id]?.status === 'inactive').length || 0}
              </div>
              <div className="text-sm text-gray-600">Inactive Users</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(userActivities).reduce((sum, activity) => sum + activity.irrigation_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Irrigations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="">All Counties</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={exportUsers} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={() => refetchUsers()} variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management ({users?.length || 0} users)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Info</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Farm Details</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => {
                  const activity = userActivities[user.id];
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.full_name || 'No name'}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone_number || 'No phone'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.county || 'Unknown'}
                          </div>
                          {user.sub_county && (
                            <div className="text-xs text-gray-500">{user.sub_county}</div>
                          )}
                          {user.ward && (
                            <div className="text-xs text-gray-400">{user.ward}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{user.farm_name || 'No farm name'}</div>
                          <div className="text-xs text-gray-500">
                            {user.farm_size_acres ? `${user.farm_size_acres} acres` : 'Size unknown'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.crop_types?.length ? `${user.crop_types.length} crops` : 'No crops listed'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {activity && (
                          <div className="space-y-1">
                            <div className="text-xs">🌊 {activity.irrigation_count} irrigations</div>
                            <div className="text-xs">📡 {activity.sensor_count} sensor readings</div>
                            <div className="text-xs">🎫 {activity.support_tickets} tickets</div>
                            <div className="text-xs">🛒 {activity.orders_count} orders</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {activity && getStatusBadge(activity.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details: {user.full_name}</DialogTitle>
                                <DialogDescription>
                                  Complete profile and activity information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Personal Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Name:</strong> {user.full_name || 'Not provided'}</div>
                                    <div><strong>Phone:</strong> {user.phone_number || 'Not provided'}</div>
                                    <div><strong>County:</strong> {user.county || 'Not provided'}</div>
                                    <div><strong>Sub County:</strong> {user.sub_county || 'Not provided'}</div>
                                    <div><strong>Ward:</strong> {user.ward || 'Not provided'}</div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Farm Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Farm Name:</strong> {user.farm_name || 'Not provided'}</div>
                                    <div><strong>Size:</strong> {user.farm_size_acres ? `${user.farm_size_acres} acres` : 'Not provided'}</div>
                                    <div><strong>Crops:</strong> {user.crop_types?.join(', ') || 'None listed'}</div>
                                    <div><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
                                    <div><strong>Last Updated:</strong> {new Date(user.updated_at).toLocaleDateString()}</div>
                                  </div>
                                </div>
                              </div>
                              {activity && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                  <h4 className="font-semibold mb-2">Activity Summary</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <div className="font-medium">{activity.irrigation_count}</div>
                                      <div className="text-gray-600">Irrigations</div>
                                    </div>
                                    <div>
                                      <div className="font-medium">{activity.sensor_count}</div>
                                      <div className="text-gray-600">Sensor Readings</div>
                                    </div>
                                    <div>
                                      <div className="font-medium">{activity.support_tickets}</div>
                                      <div className="text-gray-600">Support Tickets</div>
                                    </div>
                                    <div>
                                      <div className="font-medium">{activity.orders_count}</div>
                                      <div className="text-gray-600">Orders</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete {user.full_name || 'this user'} and all associated data including irrigation logs, sensor data, and support tickets. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeUserMonitoring;