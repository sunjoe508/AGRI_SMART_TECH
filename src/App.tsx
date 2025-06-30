
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdminAuth from "./pages/AdminAuth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSignup from "./pages/AdminSignup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener for farmers system only
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-blue-100 dark:from-green-900 dark:via-emerald-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 dark:text-green-200 font-semibold">Loading AgriSmart...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Farmers System Routes */}
              <Route 
                path="/" 
                element={
                  !user ? <Index /> : <Dashboard user={user} />
                } 
              />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Separate Admin System Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              
              {/* Legacy Admin Routes (kept for compatibility) */}
              <Route path="/admin-auth" element={<AdminAuth />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
