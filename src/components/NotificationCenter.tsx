
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCircle, AlertTriangle, Info, Droplets, Ticket, DollarSign, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source?: string;
}

interface NotificationCenterProps {
  user?: any;
}

const NotificationCenter = ({ user }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Load real notifications from activity_logs and support_tickets
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        // Fetch recent activity logs
        const { data: activities } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch recent ticket updates
        const { data: tickets } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        const notifs: Notification[] = [];

        // Convert activities to notifications
        activities?.forEach((a) => {
          let type: Notification['type'] = 'info';
          if (a.activity_type?.includes('irrigation')) type = 'success';
          if (a.activity_type?.includes('sensor')) type = 'info';
          if (a.activity_type?.includes('transaction') || a.activity_type?.includes('budget')) type = 'success';
          if (a.activity_type?.includes('ticket')) type = 'warning';

          notifs.push({
            id: a.id,
            type,
            title: a.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Activity',
            message: a.activity_description,
            timestamp: new Date(a.created_at),
            read: false,
            source: 'activity',
          });
        });

        // Convert ticket status changes to notifications
        tickets?.forEach((t) => {
          if (t.status !== 'open') {
            notifs.push({
              id: `ticket-${t.id}`,
              type: t.status === 'resolved' ? 'success' : t.status === 'in_progress' ? 'info' : 'warning',
              title: `Ticket ${t.status === 'resolved' ? 'Resolved' : t.status === 'in_progress' ? 'In Progress' : 'Updated'}`,
              message: `Your ticket "${t.subject}" is now ${t.status?.replace('_', ' ')}`,
              timestamp: new Date(t.updated_at),
              read: false,
              source: 'ticket',
            });
          }
        });

        // Sort by timestamp
        notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(notifs.slice(0, 15));
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    loadNotifications();

    // Realtime subscriptions for live notifications
    const activityChannel = supabase
      .channel('user-activity-notifs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const a = payload.new as any;
        const newNotif: Notification = {
          id: a.id,
          type: 'info' as const,
          title: a.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Activity',
          message: a.activity_description,
          timestamp: new Date(a.created_at),
          read: false,
          source: 'activity',
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 20));
      })
      .subscribe();

    const ticketChannel = supabase
      .channel('user-ticket-notifs')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_tickets',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const t = payload.new as any;
        const ticketNotif: Notification = {
          id: `ticket-${t.id}-${Date.now()}`,
          type: (t.status === 'resolved' ? 'success' : 'info') as Notification['type'],
          title: `Ticket ${t.status === 'resolved' ? 'Resolved' : 'Updated'}`,
          message: `Your ticket "${t.subject}" is now ${t.status?.replace('_', ' ')}`,
          timestamp: new Date(),
          read: false,
          source: 'ticket',
        };
        setNotifications(prev => [ticketNotif, ...prev].slice(0, 20));

        toast({
          title: "🎫 Ticket Updated",
          description: `Your ticket "${t.subject}" status: ${t.status?.replace('_', ' ')}`,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(ticketChannel);
    };
  }, [user, toast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string, source?: string) => {
    if (source === 'ticket') return <Ticket className="w-5 h-5 text-orange-500" />;
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button
        variant="default"
        size="default"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-4 py-2"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        <span className="ml-2 font-semibold hidden sm:inline">Alerts</span>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs bg-red-600 text-white border-2 border-white shadow-md animate-bounce">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-14 w-[340px] sm:w-96 max-h-[500px] overflow-hidden shadow-2xl z-50 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-b from-card to-card/95 backdrop-blur-sm">
          <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-lg font-bold text-foreground">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">{unreadCount} new</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs hover:bg-amber-100 dark:hover:bg-amber-900">
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="hover:bg-red-100 dark:hover:bg-red-900">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50 text-amber-400" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">Activity will appear here as you use the system</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer ${
                      !notification.read ? 'bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/50 dark:to-orange-950/50 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/50' :
                          notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                          notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/50' :
                          'bg-blue-100 dark:bg-blue-900/50'
                        }`}>
                          {getIcon(notification.type, notification.source)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse flex-shrink-0 shadow-lg shadow-amber-500/50"></span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                        className="p-1 h-auto hover:bg-red-100 dark:hover:bg-red-900 rounded-full flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationCenter;
