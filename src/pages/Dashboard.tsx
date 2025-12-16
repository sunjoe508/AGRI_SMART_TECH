
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedDashboard } from "@/components/UnifiedDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Wrench } from "lucide-react";

const MAINTENANCE_KEY = 'agrismart_maintenance_mode';

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Check maintenance mode periodically
  useEffect(() => {
    const checkMaintenance = () => {
      const isInMaintenance = localStorage.getItem(MAINTENANCE_KEY) === 'true';
      setMaintenanceMode(isInMaintenance);
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 5000);
    return () => clearInterval(interval);
  }, []);

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

  if (maintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950 dark:via-orange-950 dark:to-red-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-yellow-400 dark:border-yellow-600">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-10 h-10 text-yellow-600 dark:text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              System Under Maintenance
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              AgriSmart is currently undergoing scheduled maintenance to improve your experience. 
              We'll be back shortly!
            </p>
            <div className="flex items-center justify-center space-x-2 text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Please check back in a few minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
