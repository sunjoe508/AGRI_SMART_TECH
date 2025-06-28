
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Shield, Mail, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    resetEmail: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for password reset flow
  useEffect(() => {
    const checkPasswordReset = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        setIsResettingPassword(true);
        
        // Set the session with the tokens
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('Error setting session:', error);
          toast({
            title: "❌ Session Error",
            description: "Failed to verify reset link. Please try again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "✅ Reset Link Verified",
            description: "Please enter your new password below.",
          });
        }
      }
    };

    checkPasswordReset();
  }, [searchParams, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    return email.includes('@') && email.length > 0;
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "❌ Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "❌ Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Ensure only the specific admin email can sign in
    if (formData.email !== 'joemunga329@gmail.com') {
      toast({
        title: "❌ Access Denied",
        description: "This email is not authorized for admin access.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
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

      if (data.user) {
        // Check if user is an admin
        const { data: adminCheck, error: adminError } = await supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .single();

        if (adminError || !adminCheck) {
          // Sign out the user if they're not an admin
          await supabase.auth.signOut();
          toast({
            title: "❌ Access Denied",
            description: "This account does not have admin privileges.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "🎉 Welcome Admin!",
          description: "Successfully signed in to AgriSmart Admin Dashboard",
        });
        
        navigate('/');
      }
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

  const handlePasswordReset = async () => {
    if (!formData.resetEmail) {
      toast({
        title: "❌ Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(formData.resetEmail)) {
      toast({
        title: "❌ Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Ensure only the admin email can reset password
    if (formData.resetEmail !== 'joemunga329@gmail.com') {
      toast({
        title: "❌ Access Denied",
        description: "This email is not authorized for admin access.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.resetEmail, {
        redirectTo: `${window.location.origin}/admin-auth?type=recovery`
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "📧 Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "❌ Missing Information",
        description: "Please enter both password fields",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "❌ Passwords Don't Match",
        description: "Please ensure both password fields match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "❌ Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "✅ Password Updated",
        description: "Your password has been successfully updated. Redirecting to dashboard...",
      });

      // Redirect to admin dashboard after successful password update
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "❌ Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin-auth?verify=admin`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "🔐 Admin Google Sign In",
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

  // Show password reset form if in password reset mode
  if (isResettingPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="w-10 h-10 text-purple-600" />
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-purple-800">Reset Admin Password</h1>
            <p className="text-gray-600">Enter your new password</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-purple-800 flex items-center justify-center space-x-2">
                <Shield className="w-6 h-6" />
                <span>New Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button 
                onClick={handlePasswordUpdate}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <span>Admin Access</span>
            </CardTitle>
            <CardDescription>
              Restricted access for authorized administrators only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Default Admin:</strong> joemunga329@gmail.com | Password: joe123
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 mb-6">
                  <Button 
                    onClick={signInWithGoogle}
                    className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google (Admin)
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="joemunga329@gmail.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
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
                  onClick={handleSignIn}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Access Admin Dashboard'}
                </Button>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4">
                {resetEmailSent && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Password reset email sent! Please check your inbox and click the link to reset your password.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reset-email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="joemunga329@gmail.com"
                      className="pl-10"
                      value={formData.resetEmail}
                      onChange={(e) => handleInputChange('resetEmail', e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handlePasswordReset}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Reset Email...' : 'Send Password Reset'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <p className="text-sm text-purple-800 font-semibold mb-2">🔐 Secure Admin Portal</p>
            <p className="text-xs text-gray-600">
              Only joemunga329@gmail.com is authorized for admin access.
              All access attempts are logged and monitored.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate('/auth')}
            >
              Farmer Login Portal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
