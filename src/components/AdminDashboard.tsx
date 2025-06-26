
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ShoppingCart, BarChart3, Settings, Eye, Edit } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  county: string;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  product_name: string;
  vendor_name: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
  user_name: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch users from profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch orders with separate queries for related data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          vendor_products (product_name),
          vendors (name)
        `);

      if (ordersError) throw ordersError;

      // Fetch user profiles for orders
      const userIds = ordersData?.map(order => order.user_id) || [];
      const { data: orderUsers, error: orderUsersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (orderUsersError) throw orderUsersError;

      const formattedUsers = profilesData?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'N/A',
        email: 'N/A', // Email not stored in profiles
        phone_number: profile.phone_number || 'N/A',
        county: profile.county || 'N/A',
        created_at: profile.created_at
      })) || [];

      // Create a map of user IDs to names
      const userNameMap = orderUsers?.reduce((acc, user) => {
        acc[user.id] = user.full_name || 'N/A';
        return acc;
      }, {} as Record<string, string>) || {};

      const formattedOrders = ordersData?.map(order => ({
        id: order.id,
        user_id: order.user_id,
        product_name: order.vendor_products?.product_name || 'N/A',
        vendor_name: order.vendors?.name || 'N/A',
        quantity: order.quantity,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        user_name: userNameMap[order.user_id] || 'N/A'
      })) || [];

      setUsers(formattedUsers);
      setOrders(formattedOrders);

      // Calculate stats
      const pendingOrders = formattedOrders.filter(order => order.status === 'pending').length;
      const totalRevenue = formattedOrders.reduce((sum, order) => sum + order.total_amount, 0);

      setStats({
        totalUsers: formattedUsers.length,
        totalOrders: formattedOrders.length,
        pendingOrders: pendingOrders,
        totalRevenue: totalRevenue
      });

    } catch (error: any) {
      console.error('Admin data fetch error:', error);
      toast({
        title: "❌ Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "✅ Order Updated",
        description: "Order status updated successfully",
      });

      fetchAdminData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "❌ Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Orders</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-900">KSh {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="orders">Orders Management</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.phone_number}</TableCell>
                      <TableCell>{user.county}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.user_name}</TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell>{order.vendor_name}</TableCell>
                      <TableCell>KSh {order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            order.status === 'pending' ? 'destructive' :
                            order.status === 'confirmed' ? 'default' :
                            order.status === 'delivered' ? 'secondary' : 'outline'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Deliver
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
