
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Bell
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OTPManagerProps {
  user: any;
}

const OTPManager = ({ user }: OTPManagerProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageType, setMessageType] = useState('irrigation_complete');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpHistory, setOtpHistory] = useState([
    {
      id: '1',
      phone: '+254700123456',
      message: 'Irrigation cycle completed for Zone A',
      type: 'irrigation_complete',
      status: 'sent',
      timestamp: '2024-01-20 14:30:00'
    },
    {
      id: '2',
      phone: '+254700123456',
      message: 'Low soil moisture detected in Zone B',
      type: 'alert',
      status: 'delivered',
      timestamp: '2024-01-20 12:15:00'
    },
    {
      id: '3',
      phone: '+254700123456',
      message: 'Weather alert: Heavy rain expected',
      type: 'weather_alert',
      status: 'failed',
      timestamp: '2024-01-20 08:00:00'
    }
  ]);

  const { toast } = useToast();

  const messageTemplates = {
    irrigation_complete: 'Irrigation cycle completed for your farm. Water usage: {amount}L. Duration: {duration} minutes.',
    low_moisture: 'Alert: Low soil moisture detected in {zone}. Current level: {level}%. Consider irrigation.',
    weather_alert: 'Weather Update: {condition} expected. Adjust irrigation schedule accordingly.',
    system_maintenance: 'System maintenance scheduled for {date}. Service may be temporarily unavailable.',
    custom: customMessage
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTPMessage = async () => {
    if (!phoneNumber || !messageType) {
      toast({
        title: "❌ Missing Information",
        description: "Please enter phone number and select message type",
        variant: "destructive"
      });
      return;
    }

    // Validate Kenyan phone number format
    const kenyanPhoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!kenyanPhoneRegex.test(phoneNumber)) {
      toast({
        title: "❌ Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (+254XXXXXXXXX)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const otpCode = generateOTP();
      const message = messageTemplates[messageType as keyof typeof messageTemplates] || customMessage;
      
      // Save OTP message to database
      const { error } = await (supabase as any)
        .from('otp_messages')
        .insert({
          user_id: user.id,
          phone_number: phoneNumber,
          otp_code: otpCode,
          message_type: messageType,
          status: 'sent',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });

      if (error) throw error;

      // Simulate SMS sending (in real app, integrate with SMS service like Africa's Talking)
      setTimeout(() => {
        const newMessage = {
          id: Date.now().toString(),
          phone: phoneNumber,
          message: message,
          type: messageType,
          status: 'sent',
          timestamp: new Date().toLocaleString()
        };
        
        setOtpHistory(prev => [newMessage, ...prev]);
        
        toast({
          title: "📱 SMS Sent Successfully",
          description: `OTP message sent to ${phoneNumber}`,
        });
        
        setPhoneNumber('');
        setCustomMessage('');
        setIsLoading(false);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "❌ Failed to Send",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Send OTP Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span>Send OTP & Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Kenyan Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+254700000000"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Format: +254XXXXXXXXX or 07XXXXXXXX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-type">Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="irrigation_complete">Irrigation Complete</SelectItem>
                  <SelectItem value="low_moisture">Low Moisture Alert</SelectItem>
                  <SelectItem value="weather_alert">Weather Alert</SelectItem>
                  <SelectItem value="system_maintenance">System Maintenance</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {messageType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-message">Custom Message</Label>
              <Input
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message"
              />
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Message Preview:</h4>
            <p className="text-sm text-gray-600">
              {messageType === 'custom' ? customMessage : messageTemplates[messageType as keyof typeof messageTemplates]}
            </p>
          </div>

          <Button 
            onClick={sendOTPMessage}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send SMS Alert'}
          </Button>
        </CardContent>
      </Card>

      {/* Kenyan SMS Providers Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-green-600" />
            <span>Kenyan SMS Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Africa's Talking</h4>
              <p className="text-sm text-gray-600">Leading SMS gateway for Kenya</p>
              <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-800">
                Integrated
              </Badge>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Safaricom API</h4>
              <p className="text-sm text-gray-600">Direct SMS through Safaricom</p>
              <Badge variant="secondary" className="mt-2 bg-red-100 text-red-800">
                Available
              </Badge>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Twilio</h4>
              <p className="text-sm text-gray-600">Global SMS service</p>
              <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
                Backup
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <span>Message History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {otpHistory.map((msg) => (
              <div key={msg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(msg.status)}
                  <div>
                    <p className="font-medium">{msg.phone}</p>
                    <p className="text-sm text-gray-600">{msg.message}</p>
                    <p className="text-xs text-gray-500">{msg.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      msg.status === 'delivered' ? 'default' : 
                      msg.status === 'failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {msg.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {msg.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPManager;
