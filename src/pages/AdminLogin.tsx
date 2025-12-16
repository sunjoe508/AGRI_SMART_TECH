
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Sprout, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast({
        title: "❌ Missing Information",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    if (formData.username !== 'joe' || formData.password !== 'mungai123') {
      toast({
        title: "❌ Invalid Credentials",
        description: "Please check your username and password and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Store admin session in localStorage
      localStorage.setItem('adminSession', JSON.stringify({
        username: formData.username,
        loginTime: new Date().toISOString(),
        isAdmin: true
      }));

      toast({
        title: "🎉 Welcome Admin!",
        description: "Successfully signed in to AgriSmart Admin Dashboard",
      });
      
      navigate('/admin-dashboard');
    } catch (error: any) {
      toast({
        title: "❌ Login Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-10 h-10 text-purple-600" />
            <Sprout className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-purple-800">AgriSmart Admin Portal</h1>
          <p className="text-gray-600">Secure Administrative Access</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800 flex items-center justify-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Admin Login</span>
            </CardTitle>
            <CardDescription>Enter your admin credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="joe"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your admin password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Access Admin Dashboard'}
            </Button>

            <div className="text-center mt-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <p className="text-sm text-purple-800 font-semibold mb-2">🔐 Independent Admin System</p>
                <p className="text-xs text-gray-600">
                  This is a separate admin interface from the farmers system.
                  All admin functions are isolated and secure.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/')}
                >
                  Back to Farmers Portal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
