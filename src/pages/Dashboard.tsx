
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedDashboard } from "@/components/UnifiedDashboard";

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  // Fetch user profile with proper error handling
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1 * 60 * 1000,
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return <UnifiedDashboard user={user} profile={profile} />;
};

export default Dashboard;
