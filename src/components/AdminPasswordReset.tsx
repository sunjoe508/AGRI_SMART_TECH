
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return email.includes('@') && email.length > 0;
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "❌ Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(resetEmail)) {
      toast({
        title: "❌ Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (resetEmail !== 'joemunga329@gmail.com') {
      toast({
        title: "❌ Access Denied",
        description: "This email is not authorized for admin access.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
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

  return (
    <div className="space-y-4">
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
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
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
    </div>
  );
};

export default AdminPasswordReset;
