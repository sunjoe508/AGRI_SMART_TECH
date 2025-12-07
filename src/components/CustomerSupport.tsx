
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  User, 
  Send,
  CheckCircle,
  AlertTriangle,
  Headphones
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SupportTicket } from '@/types/database';

interface CustomerSupportProps {
  user: any;
}

const CustomerSupport = ({ user }: CustomerSupportProps) => {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSupportTickets();
    }
  }, [user]);

  const fetchSupportTickets = async () => {
    try {
      const { data, error } = await (supabase
        .from('support_tickets' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setSupportTickets(data || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
    }
  };

  const submitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await (supabase
        .from('support_tickets' as any)
        .insert({
          user_id: user.id,
          subject: ticketForm.subject,
          message: ticketForm.message,
          priority: ticketForm.priority,
          status: 'open'
        } as any) as any);

      if (error) throw error;

      toast({
        title: "🎫 Ticket Submitted",
        description: "Your support ticket has been submitted successfully",
      });

      setTicketForm({ subject: '', message: '', priority: 'medium' });
      fetchSupportTickets();
    } catch (error: any) {
      toast({
        title: "❌ Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6 text-center">
            <Phone className="w-12 h-12 mx-auto mb-3 text-green-200" />
            <h3 className="font-bold text-lg mb-2">Call Us</h3>
            <p className="text-green-100 mb-2">24/7 Support Hotline</p>
            <p className="font-semibold">+254 700 123 456</p>
            <p className="text-sm text-green-100">Safaricom: *544#</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 mx-auto mb-3 text-blue-200" />
            <h3 className="font-bold text-lg mb-2">Email Support</h3>
            <p className="text-blue-100 mb-2">Technical Assistance</p>
            <p className="font-semibold">support@agrismart.co.ke</p>
            <p className="text-sm text-blue-100">Response: 2-4 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-purple-200" />
            <h3 className="font-bold text-lg mb-2">Visit Us</h3>
            <p className="text-purple-100 mb-2">Nairobi Office</p>
            <p className="font-semibold">Westlands, Kenya</p>
            <p className="text-sm text-purple-100">Mon-Fri: 8AM-6PM</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Support Ticket */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Headphones className="w-6 h-6 text-orange-600" />
            <span>Create Support Ticket</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select 
                value={ticketForm.priority} 
                onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - General Question</SelectItem>
                  <SelectItem value="medium">Medium - Technical Issue</SelectItem>
                  <SelectItem value="high">High - System Down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Detailed Message</Label>
            <Textarea
              id="message"
              value={ticketForm.message}
              onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please describe your issue in detail. Include any error messages or steps to reproduce the problem."
              rows={5}
            />
          </div>

          <Button 
            onClick={submitTicket}
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
          </Button>
        </CardContent>
      </Card>

      {/* Kenyan Agricultural Support Centers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span>Kenya Agricultural Support Centers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Nairobi Regional Center</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Address:</strong> Kilimo House, Cathedral Road</p>
                <p><strong>Phone:</strong> +254 20 2718870</p>
                <p><strong>Services:</strong> Technical Support, Training</p>
                <p><strong>Hours:</strong> Mon-Fri 8:00AM - 5:00PM</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Nakuru Field Office</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Address:</strong> KALRO Kabete, Nakuru</p>
                <p><strong>Phone:</strong> +254 51 2211668</p>
                <p><strong>Services:</strong> Field Support, Equipment</p>
                <p><strong>Hours:</strong> Mon-Fri 8:00AM - 5:00PM</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Mombasa Coastal Center</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Address:</strong> Mtwapa Agricultural Center</p>
                <p><strong>Phone:</strong> +254 41 2485570</p>
                <p><strong>Services:</strong> Irrigation Systems, Coastal Farming</p>
                <p><strong>Hours:</strong> Mon-Fri 8:00AM - 5:00PM</p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Kisumu Western Center</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Address:</strong> Maseno Agricultural Hub</p>
                <p><strong>Phone:</strong> +254 57 2020000</p>
                <p><strong>Services:</strong> Water Management, Crop Advisory</p>
                <p><strong>Hours:</strong> Mon-Fri 8:00AM - 5:00PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Ticket History */}
      {supportTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span>Your Support Tickets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportTickets.map((ticket: any) => (
                <div key={ticket.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{ticket.subject}</h4>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <Badge variant="outline">{ticket.status}</Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{ticket.message}</p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">How do I set up my irrigation zones?</h4>
              <p className="text-sm text-gray-600">
                Go to the Irrigation tab, click "Add Zone", and follow the setup wizard. You'll need to specify the crop type, area size, and soil type for optimal water management.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">What should I do if sensors go offline?</h4>
              <p className="text-sm text-gray-600">
                Check the battery level first. If low, replace batteries. Ensure good network coverage. If issues persist, contact support with the sensor ID.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">How accurate is the weather forecast?</h4>
              <p className="text-sm text-gray-600">
                Our weather data comes from Kenya Meteorological Department and is updated every 6 hours with 85-90% accuracy for 7-day forecasts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSupport;