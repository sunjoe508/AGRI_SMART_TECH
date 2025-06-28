
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Mail, UserPlus, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminManagement = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sendAdminInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "❌ Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Only allow the specific admin email
    if (inviteEmail !== 'joemunga329@gmail.com') {
      toast({
        title: "❌ Access Denied",
        description: "Only joemunga329@gmail.com is authorized for admin access.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate admin token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_admin_token', { admin_email: inviteEmail });

      if (tokenError) throw tokenError;

      // Send invitation email
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-admin-email', {
        body: {
          type: 'admin_invite',
          email: inviteEmail,
          token: tokenData
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "🎉 Admin Invitation Sent!",
        description: `Invitation email sent to ${inviteEmail}`,
      });

      setInviteEmail('');
    } catch (error: any) {
      console.error('Error sending admin invite:', error);
      toast({
        title: "❌ Failed to Send Invitation",
        description: error.message || "An error occurred while sending the invitation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "❌ Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Only allow the specific admin email
    if (resetEmail !== 'joemunga329@gmail.com') {
      toast({
        title: "❌ Access Denied",
        description: "Only joemunga329@gmail.com is authorized for admin access.",
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

      // Also send custom email notification
      await supabase.functions.invoke('send-admin-email', {
        body: {
          type: 'password_reset',
          email: resetEmail,
          resetUrl: `${window.location.origin}/admin-auth?type=recovery`
        }
      });

      toast({
        title: "🔒 Password Reset Sent!",
        description: `Password reset email sent to ${resetEmail}. Click the link to reset your password.`,
      });

      setResetEmail('');
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast({
        title: "❌ Failed to Send Reset",
        description: error.message || "An error occurred while sending the password reset",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToAdminSignup = () => {
    navigate('/admin-signup');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Direct Admin Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Direct Registration</span>
            </CardTitle>
            <CardDescription>
              Register a new admin account directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={navigateToAdminSignup}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Admin
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Direct registration for joemunga329@gmail.com
            </p>
          </CardContent>
        </Card>

        {/* Create Admin Invitation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span>Send Invitation</span>
            </CardTitle>
            <CardDescription>
              Send an invitation email to create a new admin account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Admin Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="joemunga329@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={sendAdminInvite}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Admin Invitation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Password Reset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-orange-600" />
              <span>Reset Password</span>
            </CardTitle>
            <CardDescription>
              Send a password reset email to the admin user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Admin Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="joemunga329@gmail.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={sendPasswordReset}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending Reset...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Send Password Reset
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">📋 Admin Management Instructions:</h4>
            <ul className="space-y-2 text-blue-700 dark:text-blue-300">
              <li>• <strong>Direct Registration:</strong> Click "Create New Admin" to register directly without invitation</li>
              <li>• <strong>Admin Access:</strong> Only joemunga329@gmail.com is authorized for admin access</li>
              <li>• <strong>Default Password:</strong> joe123 (can be changed via password reset)</li>
              <li>• <strong>Password Reset:</strong> Reset link will redirect directly to admin dashboard after password update</li>
              <li>• <strong>Security:</strong> All tokens expire automatically for security</li>
              <li>• <strong>Email Integration:</strong> For production, integrate with a service like Resend or SendGrid</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManagement;
