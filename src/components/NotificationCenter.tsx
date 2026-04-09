
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, X, CheckCircle, AlertTriangle, Info, Ticket, Check } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Load real notifications from activity_logs and support_tickets
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { data: activities } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const { data: tickets } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        const notifs: Notification[] = [];

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

        notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(notifs.slice(0, 15));
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    loadNotifications();

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
          type: 'info',
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
    if (source === 'ticket') return <Ticket className="w-4 h-4" />;
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string, source?: string) => {
    if (source === 'ticket') return 'text-orange-500 bg-orange-100 dark:bg-orange-900/40';
    switch (type) {
      case 'success': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40';
      case 'warning': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/40';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/40';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/40';
    }
  };

  const getBorderColor = (type: string, source?: string) => {
    if (source === 'ticket') return 'border-l-orange-500';
    switch (type) {
      case 'success': return 'border-l-emerald-500';
      case 'warning': return 'border-l-amber-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 rounded-full hover:bg-accent"
      >
        <Bell className={`w-5 h-5 text-foreground ${unreadCount > 0 ? 'animate-[ring_0.5s_ease-in-out_infinite]' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60"></span>
            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-[100] w-[360px] max-w-[calc(100vw-1rem)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <Card className="shadow-2xl border border-border overflow-hidden">
            {/* Header */}
            <CardHeader className="px-4 py-3 border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Read all
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New activity will appear here
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 border-l-[3px] ${
                          !notification.read
                            ? `bg-muted/30 ${getBorderColor(notification.type, notification.source)}`
                            : 'border-l-transparent'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(notification.type, notification.source)}`}>
                          {getIcon(notification.type, notification.source)}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>

                        {/* Dismiss */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); removeNotification(notification.id); }}
                          className="flex-shrink-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
