
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Mail, Phone, User, Eye, EyeOff, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    county: '',
    farmName: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const kenyanCounties = [
    'Nairobi', 'Kiambu', 'Nakuru', 'Meru', 'Kisumu', 'Mombasa', 
    'Uasin Gishu', 'Murang\'a', 'Nyeri', 'Machakos', 'Kajiado',
    'Nyandarua', 'Laikipia', 'Kirinyaga', 'Embu', 'Tharaka Nithi',
    'Makueni', 'Kitui', 'Garissa', 'Wajir', 'Mandera'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (isSignUp: boolean = false) => {
    if (!formData.email) {
      toast({
        title: "❌ Validation Error",
        description: "Email is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: "❌ Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.password) {
      toast({
        title: "❌ Validation Error",
        description: "Password is required",
        variant: "destructive"
      });
      return false;
    }

    if (isSignUp) {
      if (formData.password.length < 6) {
        toast({
          title: "❌ Validation Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "❌ Validation Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return false;
      }

      if (!formData.fullName) {
        toast({
          title: "❌ Validation Error",
          description: "Full name is required",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const createAdminUser = async () => {
    try {
      // First try to sign up the admin user
      const { error: signUpError } = await supabase.auth.signUp({
        email: 'admin@agrismart.co.ke',
        password: 'admin123',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: 'AgriSmart Admin',
            phone_number: '+254700000000',
            county: 'Nairobi',
            farm_name: 'AgriSmart HQ'
          }
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('Admin creation error:', signUpError);
        return false;
      }

      console.log('Admin user setup completed');
      return true;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "🌱 Welcome to AgriSmart!",
        description: "Signing in with Google...",
      });
    } catch (error: any) {
      toast({
        title: "❌ Authentication Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            county: formData.county,
            farm_name: formData.farmName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "⚠️ Account Exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setEmailSent(true);
      toast({
        title: "🌱 Account Created Successfully!",
        description: "Please check your email to verify your account before signing in.",
      });
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: '',
        county: '',
        farmName: ''
      });
    } catch (error: any) {
      toast({
        title: "❌ Signup Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // If this is admin login, ensure admin user exists first
      if (formData.email === 'admin@agrismart.co.ke') {
        console.log('Admin login attempt - ensuring admin user exists');
        await createAdminUser();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          // If admin login fails, try creating the admin user first
          if (formData.email === 'admin@agrismart.co.ke') {
            toast({
              title: "🔧 Setting up Admin Account",
              description: "Creating admin user for first-time login...",
            });
            
            const adminCreated = await createAdminUser();
            if (adminCreated) {
              // Wait a moment and try again
              setTimeout(async () => {
                const { error: retryError } = await supabase.auth.signInWithPassword({
                  email: formData.email,
                  password: formData.password
                });
                
                if (retryError) {
                  toast({
                    title: "ℹ️ Admin Setup Complete",
                    description: "Admin user created! Please verify your email and try signing in again.",
                    variant: "default"
                  });
                } else {
                  toast({
                    title: "🎉 Welcome Admin!",
                    description: "Successfully signed in to AgriSmart Admin Dashboard",
                  });
                  navigate('/');
                }
                setIsLoading(false);
              }, 2000);
              return;
            }
          }
          
          toast({
            title: "❌ Invalid Credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive"
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "⚠️ Email Not Verified",
            description: "Please check your email and click the verification link before signing in.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      const isAdmin = formData.email === 'admin@agrismart.co.ke';
      toast({
        title: isAdmin ? "🎉 Welcome Admin!" : "🌱 Welcome Back!",
        description: isAdmin ? "Successfully signed in to AgriSmart Admin Dashboard" : "Successfully signed in to AgriSmart",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "❌ Sign In Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setFormData(prev => ({
      ...prev,
      email: 'admin@agrismart.co.ke',
      password: 'admin123'
    }));
    setAdminMode(true);
    toast({
      title: "🔑 Admin Credentials Filled",
      description: "Click Sign In to access the admin dashboard",
    });
  };

  const fillDemoCredentials = () => {
    setFormData(prev => ({
      ...prev,
      email: 'demo@farmer.co.ke',
      password: 'demo123'
    }));
    setAdminMode(false);
    toast({
      title: "👨‍🌾 Demo Farmer Credentials Filled",
      description: "Click Sign In to access the farmer dashboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sprout className="w-10 h-10 text-green-600 dark:text-green-400" />
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">AgriSmart Kenya</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Smart Irrigation for Kenyan Farmers</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-800 dark:text-green-200">
              {adminMode ? '🔐 Admin Access' : '🌱 Join AgriSmart'}
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              {adminMode ? 'Access the administrative dashboard' : 'Connect with Kenya\'s smart farming revolution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  ✅ Verification email sent! Please check your inbox and click the verification link before signing in.
                </AlertDescription>
              </Alert>
            )}

            {adminMode && (
              <Alert className="mb-6 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <AlertDescription className="text-purple-800 dark:text-purple-200">
                  🔐 Admin Mode: Enhanced security and management features enabled
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 mb-6">
              <Button 
                onClick={signInWithGoogle}
                className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground dark:text-gray-400">Or continue with</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 dark:bg-gray-800">
                <TabsTrigger value="signin" className="dark:data-[state=active]:bg-gray-700">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="dark:data-[state=active]:bg-gray-700">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-sm font-medium dark:text-gray-200">Quick Access</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillAdminCredentials}
                      className="text-xs dark:border-gray-600 dark:text-gray-200 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillDemoCredentials}
                      className="text-xs dark:border-gray-600 dark:text-gray-200"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Demo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="dark:text-gray-200">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={adminMode ? "admin@agrismart.co.ke" : "farmer@example.com"}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="dark:text-gray-200">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={adminMode ? "admin123" : "Your password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 pr-10"
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
                  onClick={handleSignIn}
                  className={`w-full ${adminMode 
                    ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800' 
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (adminMode ? 'Accessing Admin...' : 'Signing In...') : (adminMode ? 'Access Admin Dashboard' : 'Sign In')}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="dark:text-gray-200">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="dark:text-gray-200">Phone Number (Kenya)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-phone"
                      placeholder="+254700000000"
                      className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-county" className="dark:text-gray-200">County</Label>
                  <Select onValueChange={(value) => handleInputChange('county', value)}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue placeholder="Select your county" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                      {kenyanCounties.map((county) => (
                        <SelectItem key={county} value={county} className="dark:text-gray-100 dark:focus:bg-gray-700">{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-farm" className="dark:text-gray-200">Farm Name</Label>
                  <Input
                    id="signup-farm"
                    placeholder="Green Valley Farm"
                    value={formData.farmName}
                    onChange={(e) => handleInputChange('farmName', e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="dark:text-gray-200">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="farmer@example.com"
                      className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="dark:text-gray-200">Password *</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create strong password (min 6 chars)"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 pr-10"
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

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="dark:text-gray-200">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleSignUp}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <p className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">🚀 Quick Demo Access</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-4 border-purple-500">
                <p className="font-medium text-purple-800 dark:text-purple-200">👑 Admin Login</p>
                <p className="text-purple-600 dark:text-purple-300">admin@agrismart.co.ke</p>
                <p className="text-purple-600 dark:text-purple-300">admin123</p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                <p className="font-medium text-green-800 dark:text-green-200">👨‍🌾 Demo Farmer</p>
                <p className="text-green-600 dark:text-green-300">demo@farmer.co.ke</p>
                <p className="text-green-600 dark:text-green-300">demo123</p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            🇰🇪 Empowering Kenyan farmers with smart technology
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
