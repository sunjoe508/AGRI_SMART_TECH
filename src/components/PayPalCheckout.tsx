
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PayPalCheckoutProps {
  amount: number;
  currency?: string;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
}

const PayPalCheckout = ({ amount, currency = "USD", onSuccess, onError }: PayPalCheckoutProps) => {
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate PayPal payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentDetails = {
        id: `PAY-${Date.now()}`,
        status: 'COMPLETED',
        amount: { value: amount.toString(), currency },
        payer: {
          email_address: 'farmer@example.com',
          payer_id: 'FARMER123'
        },
        create_time: new Date().toISOString()
      };
      
      setCompleted(true);
      onSuccess(paymentDetails);
      
      toast({
        title: "✅ Payment Successful",
        description: `Payment of $${amount} completed successfully`,
      });
    } catch (error) {
      onError?.(error);
      toast({
        title: "❌ Payment Failed",
        description: "There was an issue processing your payment",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Payment Completed!</h3>
          <p className="text-green-600 dark:text-green-300">Your order has been processed successfully.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Secure Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${amount.toFixed(2)} {currency}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={handlePayment}
          disabled={processing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          size="lg"
        >
          {processing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay with PayPal
            </>
          )}
        </Button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Secure payment processing powered by PayPal
        </p>
      </CardContent>
    </Card>
  );
};

export default PayPalCheckout;
