
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sprout, Droplets, Shield, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";

const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signupForm = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      farmName: '',
      role: 'farmer'
    }
  });

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    
    // Demo credentials
    const demoUsers = {
      'farmer@demo.com': { role: 'farmer', name: 'John Farmer', farmName: 'Green Valley Farm' },
      'admin@demo.com': { role: 'admin', name: 'Admin User', farmName: 'System Admin' }
    };

    setTimeout(() => {
      if (demoUsers[data.email as keyof typeof demoUsers] && data.password === 'demo123') {
        const user = demoUsers[data.email as keyof typeof demoUsers];
        onLogin({ ...user, email: data.email });
        toast({
          title: "🌱 Welcome to AgriSmart!",
          description: `Logged in as ${user.role}`,
        });
      } else {
        toast({
          title: "❌ Login Failed",
          description: "Use demo credentials: farmer@demo.com / admin@demo.com with password 'demo123'",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = async (data: any) => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (data.password !== data.confirmPassword) {
        toast({
          title: "❌ Signup Failed",
          description: "Passwords don't match",
          variant: "destructive"
        });
      } else {
        const user = { 
          role: data.role, 
          name: data.farmName, 
          farmName: data.farmName, 
          email: data.email 
        };
        onLogin(user);
        toast({
          title: "🌱 Account Created!",
          description: "Welcome to AgriSmart irrigation system",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sprout className="w-10 h-10 text-green-600" />
            <h1 className="text-3xl font-bold text-green-800">AgriSmart</h1>
          </div>
          <p className="text-gray-600">Smart Irrigation for Sustainable Farming</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="outline" className="bg-green-50">
              <Droplets className="w-4 h-4 mr-1" />
              Water Efficient
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              <Shield className="w-4 h-4 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800">Access Your Farm</CardTitle>
            <CardDescription>
              Secure login to your smart irrigation dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="farmer@demo.com"
                              className="bg-green-50/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="demo123"
                              className="bg-green-50/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Demo Credentials</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Farmer:</strong> farmer@demo.com / demo123</p>
                    <p><strong>Admin:</strong> admin@demo.com / demo123</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="farmName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Green Valley Farm"
                              className="bg-green-50/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="your@email.com"
                              className="bg-green-50/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Strong password"
                              className="bg-green-50/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm password"
                              className="bg-green-50/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>🌾 Supporting global food security through smart agriculture</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
