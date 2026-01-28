
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, CheckCircle, AlertTriangle, Info, Droplets, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: boolean;
}

interface NotificationCenterProps {
  user?: any;
}

const NotificationCenter = ({ user }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate real-time notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Low Soil Moisture Detected',
        message: 'Zone A soil moisture is below optimal levels. Consider irrigation.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        actionable: true
      },
      {
        id: '2',
        type: 'success',
        title: 'Irrigation Completed',
        message: 'Zone B irrigation cycle completed successfully. 45L water used.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Weather Update',
        message: 'Light rain expected tomorrow. Irrigation schedule adjusted automatically.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true
      },
      {
        id: '4',
        type: 'success',
        title: 'Yield Improvement',
        message: 'Your crop yield has increased by 12% compared to last month!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleAction = (notification: Notification) => {
    if (notification.id === '1') {
      toast({
        title: "🚰 Irrigation Started",
        description: "Zone A irrigation cycle has been initiated.",
      });
      removeNotification(notification.id);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="default"
        size="default"
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-4 py-2"
      >
        <Bell className="w-5 h-5 animate-pulse" />
        <span className="ml-2 font-semibold hidden sm:inline">Alerts</span>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center text-xs bg-red-600 text-white border-2 border-white shadow-md animate-bounce">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-14 w-96 max-h-[500px] overflow-hidden shadow-2xl z-50 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-b from-card to-card/95 backdrop-blur-sm">
          <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-lg font-bold text-foreground">Notifications</CardTitle>
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
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-all duration-200 ${
                      !notification.read ? 'bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/50 dark:to-orange-950/50 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/50' :
                          notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                          notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/50' :
                          'bg-blue-100 dark:bg-blue-900/50'
                        }`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-foreground">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse flex-shrink-0 shadow-lg shadow-amber-500/50"></span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2 font-medium">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                          {notification.actionable && !notification.read && (
                            <Button
                              size="sm"
                              className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                              onClick={() => handleAction(notification)}
                            >
                              <Droplets className="w-4 h-4 mr-2" />
                              Start Irrigation
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="p-1 h-auto hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
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
