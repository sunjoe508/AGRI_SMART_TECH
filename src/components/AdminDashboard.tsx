
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingCart, BarChart3, Settings, Eye, Edit, Trash2 } from 'lucide-react';
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
  user_profile: {
    full_name: string;
  };
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
      // Fetch users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch orders with user details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          vendor_products (product_name),
          vendors (name),
          profiles (full_name)
        `);

      if (ordersError) throw ordersError;

      const formattedUsers = profilesData.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'N/A',
        email: 'N/A', // Email not stored in profiles
        phone_number: profile.phone_number || 'N/A',
        county: profile.county || 'N/A',
        created_at: profile.created_at
      }));

      const formattedOrders = ordersData.map(order => ({
        id: order.id,
        user_id: order.user_id,
        product_name: order.vendor_products?.product_name || 'N/A',
        vendor_name: order.vendors?.name || 'N/A',
        quantity: order.quantity,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        user_profile: {
          full_name: order.profiles?.full_name || 'N/A'
        }
      }));

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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Phone</th>
                      <th className="text-left p-4">County</th>
                      <th className="text-left p-4">Joined</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{user.full_name}</td>
                        <td className="p-4">{user.phone_number}</td>
                        <td className="p-4">{user.county}</td>
                        <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Customer</th>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Vendor</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{order.user_profile.full_name}</td>
                        <td className="p-4">{order.product_name}</td>
                        <td className="p-4">{order.vendor_name}</td>
                        <td className="p-4">KSh {order.total_amount.toLocaleString()}</td>
                        <td className="p-4">
                          <Badge 
                            variant={
                              order.status === 'pending' ? 'destructive' :
                              order.status === 'confirmed' ? 'default' :
                              order.status === 'delivered' ? 'secondary' : 'outline'
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
