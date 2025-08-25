import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Import user components
import ProfileManagement from "./ProfileManagement";
import SensorMonitoring from "./SensorMonitoring";
import RealSensorMonitoring from "./RealSensorMonitoring";
import SensorRegistration from "./SensorRegistration";
import IrrigationCycle from "./IrrigationCycle";
import WeatherWidget from "./WeatherWidget";
import ReportGenerator from "./ReportGenerator";
import NotificationCenter from "./NotificationCenter";
import MobileAppGuide from "./MobileAppGuide";
import SensorTestingPanel from "./SensorTestingPanel";
import DemoDataGenerator from "./DemoDataGenerator";
import FarmRecords from "./FarmRecords";
import EnhancedFinancialManagement from "./EnhancedFinancialManagement";

interface UnifiedDashboardProps {
  user: any;
  profile?: any;
}

export function UnifiedDashboard({ user, profile }: UnifiedDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentTab = searchParams.get('tab') || 'overview';
  const currentSubTab = searchParams.get('subtab') || '';

  // Set up real-time subscriptions for live data updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for user dashboard...');
    
    // Subscribe to sensor data changes
    const sensorChannel = supabase
      .channel('user-sensor-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sensor_data',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Sensor data change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['sensor-data'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
        toast({
          title: "📡 Sensor Update",
          description: "New sensor data received",
        });
      })
      .subscribe();

    // Subscribe to irrigation logs changes
    const irrigationChannel = supabase
      .channel('user-irrigation-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'irrigation_logs',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Irrigation logs change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['irrigation-logs'] });
        toast({
          title: "🌊 Irrigation Update",
          description: "New irrigation activity logged",
        });
      })
      .subscribe();

    // Subscribe to financial transactions changes
    const financialChannel = supabase
      .channel('user-financial-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'financial_transactions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Financial transaction change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
        toast({
          title: "💰 Financial Update",
          description: "New transaction recorded",
        });
      })
      .subscribe();

    // Subscribe to farm records changes
    const farmRecordsChannel = supabase
      .channel('user-farm-records-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'farm_records',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Farm records change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['farm-records'] });
        toast({
          title: "📋 Records Update",
          description: "Farm records updated",
        });
      })
      .subscribe();

    return () => {
      console.log('Cleaning up user real-time subscriptions...');
      supabase.removeChannel(sensorChannel);
      supabase.removeChannel(irrigationChannel);
      supabase.removeChannel(financialChannel);
      supabase.removeChannel(farmRecordsChannel);
    };
  }, [user?.id, queryClient, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "👋 Logged out successfully",
        description: "See you soon!",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSensorUpdate = async () => {
    try {
      // Invalidate relevant queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['sensor-data'] });
      await queryClient.invalidateQueries({ queryKey: ['registered-sensors'] });
      await queryClient.invalidateQueries({ queryKey: ['irrigation-logs'] });
      await queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      
      toast({
        title: "🔄 Data Synchronized",
        description: "All systems updated with latest data",
      });
    } catch (error) {
      console.error('Data sync error:', error);
      toast({
        title: "⚠️ Sync Warning",
        description: "Some data may not be up to date",
        variant: "destructive"
      });
    }
  };

  const handleDataGenerated = async () => {
    try {
      await handleSensorUpdate();
      
      // Verify data was actually written to database
      const { data: recentData } = await supabase
        .from('sensor_data')
        .select('created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (recentData && recentData.length > 0) {
        toast({
          title: "✅ Data Generated Successfully",
          description: "Test data has been written to database and synchronized",
        });
      } else {
        toast({
          title: "⚠️ Data Generation Warning",
          description: "Data may not have been saved properly",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Data generation verification failed:', error);
      toast({
        title: "❌ Data Generation Failed",
        description: "Failed to generate or verify test data",
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SensorMonitoring user={user} />
              <IrrigationCycle />
            </div>
            <div className="space-y-6">
              <WeatherWidget />
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Farm Size:</span>
                    <span className="text-sm font-medium">{profile?.farm_size_acres || 0} acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm font-medium">{profile?.county || 'Kenya'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Crops:</span>
                    <span className="text-sm font-medium">{profile?.crop_types?.length || 0} types</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'sensors':
        if (currentSubTab === 'registration') {
          return <SensorRegistration user={user} onSensorUpdate={handleSensorUpdate} />;
        } else if (currentSubTab === 'testing') {
          return (
            <div className="space-y-6">
              <DemoDataGenerator user={user} onDataGenerated={handleDataGenerated} />
              <SensorTestingPanel user={user} onDataGenerated={handleDataGenerated} />
            </div>
          );
        }
        return <RealSensorMonitoring user={user} />;
      
      case 'irrigation':
        return <IrrigationCycle />;
      
      case 'reports':
        return <ReportGenerator user={user} />;
      
      case 'profile':
        return <ProfileManagement user={user} />;
      
      case 'mobile':
        return <MobileAppGuide />;
      
      case 'testing':
        return (
          <div className="space-y-6">
            <DemoDataGenerator user={user} onDataGenerated={handleDataGenerated} />
            <SensorTestingPanel user={user} onDataGenerated={handleDataGenerated} />
          </div>
        );
      
      case 'weather':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherWidget />
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Weather Integration</h3>
              <p className="text-muted-foreground mb-4">
                Weather data helps optimize your irrigation and farming decisions.
              </p>
              <div className="space-y-2 text-sm">
                <div>• Real-time weather conditions</div>
                <div>• 5-day weather forecast</div>
                <div>• Rainfall predictions</div>
                <div>• Temperature monitoring</div>
              </div>
            </div>
          </div>
        );
      
      case 'records':
        return <FarmRecords user={user} />;
      
      case 'finances':
        return <EnhancedFinancialManagement user={user} />;
      
      default:
        return <div className="text-center p-8">Select a section from the sidebar to get started.</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          userType="user" 
          onLogout={handleLogout}
          userName={profile?.full_name || 'Farmer'}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-4 flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                AgriSmart Dashboard
              </h1>
              <div className="ml-auto">
                <NotificationCenter user={user} />
              </div>
            </div>
          </header>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}