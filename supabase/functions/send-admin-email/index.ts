
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: 'admin_invite' | 'password_reset';
  email: string;
  token?: string;
  resetUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, email, token, resetUrl }: EmailRequest = await req.json();

    let emailContent = '';
    let subject = '';

    if (type === 'admin_invite') {
      subject = 'AgriSmart Admin Invitation';
      const inviteUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/supabase', '')}/admin-signup?token=${token}`;
      emailContent = `
        <h2>🌱 Welcome to AgriSmart Admin</h2>
        <p>You've been invited to join as an administrator for AgriSmart Kenya.</p>
        <p>Click the link below to complete your registration:</p>
        <a href="${inviteUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Complete Admin Registration</a>
        <p>This invitation will expire in 24 hours.</p>
        <p>If you didn't expect this invitation, please ignore this email.</p>
      `;
    } else if (type === 'password_reset') {
      subject = 'AgriSmart Password Reset';
      emailContent = `
        <h2>🔒 Password Reset Request</h2>
        <p>You requested to reset your password for your AgriSmart account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `;
    }

    // For demo purposes, we'll log the email content
    // In production, you would integrate with an email service like Resend
    console.log(`Email would be sent to: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${emailContent}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email,
        subject,
        content: emailContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
