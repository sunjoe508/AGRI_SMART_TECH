
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sprout, Shield, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TokenValidationResponse {
  valid: boolean;
  email?: string;
  message: string;
}

const AdminSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      // Allow direct signup without token for admin creation
      setTokenValid(true);
      setAdminEmail('joemunga329@gmail.com');
      toast({
        title: "✅ Admin Registration",
        description: "Creating admin account for joemunga329@gmail.com",
      });
    }
  }, [searchParams]);

  const validateToken = async (tokenValue: string) => {
    try {
      const { data, error } = await (supabase as any).rpc('validate_admin_token', {
        token_value: tokenValue
      });

      if (error) throw error;

      const response = data as unknown as TokenValidationResponse;

      if (response && typeof response === 'object' && 'valid' in response) {
        if (response.valid) {
          setTokenValid(true);
          setAdminEmail(response.email || '');
          toast({
            title: "✅ Valid Invitation",
            description: `Creating admin account for ${response.email}`,
          });
        } else {
          setTokenValid(false);
          toast({
            title: "❌ Invalid Token",
            description: response.message || "This invitation token is invalid or expired",
            variant: "destructive"
          });
        }
      } else {
        throw new Error('Invalid response format from token validation');
      }
    } catch (error: any) {
      console.error('Token validation error:', error);
      setTokenValid(false);
      toast({
        title: "❌ Validation Failed",
        description: error.message || "Failed to validate invitation token",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.password) {
      toast({
        title: "❌ Password Required",
        description: "Please enter a password",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "❌ Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "❌ Passwords Don't Match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.fullName) {
      toast({
        title: "❌ Name Required",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Create the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-auth`,
          data: {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            county: 'Admin',
            farm_name: 'AgriSmart Administration'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Assign admin role
        const { error: roleError } = await supabase
          .from('admin_roles')
          .insert({
            user_id: authData.user.id,
            role: 'admin'
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }

        toast({
          title: "🎉 Admin Account Created!",
          description: "Your admin account has been created successfully. Please check your email to verify your account.",
        });

        setTimeout(() => {
          navigate('/admin-auth');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Admin signup error:', error);
      toast({
        title: "❌ Signup Failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-800 font-semibold">Checking access...</p>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
              <h1 className="text-2xl font-bold text-red-800">Invalid Access</h1>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-600">This invitation link is invalid or has expired.</p>
            <Button 
              onClick={() => navigate('/admin-auth')}
              className="w-full"
            >
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sprout className="w-10 h-10 text-green-600" />
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-purple-800">AgriSmart Admin</h1>
          <p className="text-gray-600">Create Admin Account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800">
              🔐 Admin Registration
            </CardTitle>
            <CardDescription>
              Setting up admin account for: <strong>{adminEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Authorized admin registration
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Admin Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="+254700000000"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create secure password (min 6 chars)"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pr-10"
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
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
            </Button>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin-auth')}
                className="text-sm"
              >
                Already have an account? Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSignup;
