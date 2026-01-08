import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Ticket, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Search,
  RefreshCw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

const AdminSupportTickets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [response, setResponse] = useState('');

  // Fetch support tickets with user details
  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['admin-support-tickets', searchTerm],
    queryFn: async () => {
      // Get tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Get user profiles for ticket owners
      const userIds = [...new Set(ticketsData?.map(t => t.user_id).filter(Boolean))];
      
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, phone_number, county, sub_county, ward, farm_name')
          .in('user_id', userIds);
        
        profiles?.forEach(p => {
          profilesMap[p.user_id] = p;
        });
      }

      // Combine tickets with user info
      const enrichedTickets = ticketsData?.map(ticket => ({
        ...ticket,
        user: profilesMap[ticket.user_id] || null
      }));

      // Filter by search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return enrichedTickets?.filter(t => 
          t.subject?.toLowerCase().includes(search) ||
          t.message?.toLowerCase().includes(search) ||
          t.user?.full_name?.toLowerCase().includes(search) ||
          t.user?.county?.toLowerCase().includes(search)
        );
      }

      return enrichedTickets || [];
    },
    refetchInterval: 30000
  });

  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({
        title: "✅ Ticket Updated",
        description: "Ticket status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <Ticket className="w-5 h-5" />
              <span>Support Tickets</span>
              <Badge variant="outline" className="ml-2">
                {tickets?.length || 0} Total
              </Badge>
            </CardTitle>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets by subject, message, user, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {tickets?.filter(t => t.status === 'open').length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {tickets?.filter(t => t.status === 'in_progress').length || 0}
            </p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {tickets?.filter(t => t.status === 'resolved').length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {tickets?.filter(t => t.priority === 'high').length || 0}
            </p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading tickets...</p>
            </CardContent>
          </Card>
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className={`transition-all hover:shadow-md ${selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Ticket Info */}
                  <div className="flex-1 space-y-3">
                    {/* Header with Status and Priority */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status === 'open' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {ticket.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {ticket.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority?.toUpperCase()} PRIORITY
                      </Badge>
                    </div>

                    {/* Subject */}
                    <h3 className="font-semibold text-lg">{ticket.subject}</h3>

                    {/* Message */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <p className="text-sm">{ticket.message}</p>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Submitted By:
                      </h4>
                      {ticket.user ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ticket.user.full_name || 'Unknown User'}</span>
                          </div>
                          {ticket.user.phone_number && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {ticket.user.phone_number}
                            </div>
                          )}
                          {ticket.user.county && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {[ticket.user.ward, ticket.user.sub_county, ticket.user.county].filter(Boolean).join(', ')}
                            </div>
                          )}
                          {ticket.user.farm_name && (
                            <div className="text-muted-foreground">
                              🌾 {ticket.user.farm_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">User information not available</p>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created: {format(new Date(ticket.created_at), 'PPP')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(ticket.created_at), 'p')}
                      </div>
                      {ticket.updated_at !== ticket.created_at && (
                        <div className="flex items-center gap-1">
                          Updated: {format(new Date(ticket.updated_at), 'PPp')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
                    {ticket.status !== 'in_progress' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTicketMutation.mutate({ id: ticket.id, status: 'in_progress' })}
                        className="text-yellow-600 border-yellow-300"
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {ticket.status !== 'resolved' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTicketMutation.mutate({ id: ticket.id, status: 'resolved' })}
                        className="text-green-600 border-green-300"
                      >
                        Mark Resolved
                      </Button>
                    )}
                    {ticket.status !== 'closed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTicketMutation.mutate({ id: ticket.id, status: 'closed' })}
                        className="text-gray-600 border-gray-300"
                      >
                        Close Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold">No Support Tickets</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No tickets match your search' : 'No support tickets have been submitted yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminSupportTickets;