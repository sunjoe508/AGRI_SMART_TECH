import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Activity,
  Droplets,
  FileText,
  User,
  Smartphone,
  TestTube,
  Thermometer,
  BookOpen,
  DollarSign,
  Users,
  Shield,
  Settings,
  Database,
  Brain,
  MessageSquare,
  Award,
  Target,
  LogOut,
  Map
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  userType: 'user' | 'admin';
  onLogout: () => void;
  userName?: string;
}

export function AppSidebar({ userType, onLogout, userName }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const userNavItems = [
    { title: "Overview", url: "/?tab=overview", icon: BarChart3 },
    { title: "Live Monitoring", url: "/?tab=sensors&subtab=monitoring", icon: Activity },
    { title: "Sensor Registration", url: "/?tab=sensors&subtab=registration", icon: Settings },
    { title: "Irrigation", url: "/?tab=irrigation", icon: Droplets },
    { title: "Reports", url: "/?tab=reports", icon: FileText },
    { title: "Profile", url: "/?tab=profile", icon: User },
    { title: "Mobile App", url: "/?tab=mobile", icon: Smartphone },
    { title: "Testing", url: "/?tab=testing", icon: TestTube },
    { title: "Weather", url: "/?tab=weather", icon: Thermometer },
    { title: "Records", url: "/?tab=records", icon: BookOpen },
    { title: "Finances", url: "/?tab=finances", icon: DollarSign },
  ];

  const adminNavItems = [
    { title: "User Monitoring", url: "/admin-dashboard?tab=monitoring", icon: Users },
    { title: "Farmers Map", url: "/admin-dashboard?tab=map", icon: Map },
    { title: "Analytics", url: "/admin-dashboard?tab=analytics", icon: BarChart3 },
    { title: "AI Insights", url: "/admin-dashboard?tab=insights", icon: Brain },
    { title: "Admin Functions", url: "/admin-dashboard?tab=functions", icon: Shield },
    { title: "Command Center", url: "/admin-dashboard?tab=command", icon: Target },
    { title: "System Health", url: "/admin-dashboard?tab=health", icon: Activity },
    { title: "Support Tickets", url: "/admin-dashboard?tab=support", icon: MessageSquare },
    { title: "Reports", url: "/admin-dashboard?tab=reports", icon: FileText },
    { title: "Database", url: "/admin-dashboard?tab=database", icon: Database },
    { title: "Performance", url: "/admin-dashboard?tab=performance", icon: Award },
  ];

  const navItems = userType === 'admin' ? adminNavItems : userNavItems;

  const getNavClassName = (isActiveItem: boolean) =>
    isActiveItem 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";

  const isActiveNavItem = (url: string) => {
    if (userType === 'admin') {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const tabFromUrl = urlParams.get('tab');
      return currentPath.includes('admin-dashboard') && 
             new URLSearchParams(window.location.search).get('tab') === tabFromUrl;
    } else {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const tabFromUrl = urlParams.get('tab');
      const subtabFromUrl = urlParams.get('subtab');
      const currentParams = new URLSearchParams(window.location.search);
      const currentTab = currentParams.get('tab');
      const currentSubtab = currentParams.get('subtab');
      
      if (subtabFromUrl) {
        return currentTab === tabFromUrl && currentSubtab === subtabFromUrl;
      }
      return currentTab === tabFromUrl;
    }
  };

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-background border-r">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  AgriSmart
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {userType === 'admin' ? 'Admin Portal' : 'Dashboard'}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {userType === 'admin' ? 'Admin Controls' : 'Farm Management'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(isActiveNavItem(item.url))}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info & Logout */}
        <div className="mt-auto p-4 border-t">
          {!collapsed && userName && (
            <div className="mb-3 p-2 bg-accent rounded-lg">
              <p className="text-sm font-medium text-accent-foreground">
                Welcome back,
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userName}
              </p>
            </div>
          )}
          <Button 
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}