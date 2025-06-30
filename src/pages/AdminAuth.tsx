
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthLayout from "@/components/AdminAuthLayout";
import AdminAuthForm from "@/components/AdminAuthForm";
import AdminPasswordReset from "@/components/AdminPasswordReset";
import AdminPasswordUpdate from "@/components/AdminPasswordUpdate";

const AdminAuth = () => {
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Show password reset form if in password reset mode
  if (isResettingPassword) {
    return (
      <AdminAuthLayout title="Reset Admin Password" description="Enter your new password">
        <AdminPasswordUpdate />
      </AdminAuthLayout>
    );
  }

  return (
    <AdminAuthLayout 
      title="Admin Access" 
      description="Restricted access for authorized administrators only"
    >
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="reset">Reset Password</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4">
          <AdminAuthForm />
        </TabsContent>

        <TabsContent value="reset" className="space-y-4">
          <AdminPasswordReset />
        </TabsContent>
      </Tabs>

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
    </AdminAuthLayout>
  );
};

export default AdminAuth;
