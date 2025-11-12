import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Wallet, Phone, Globe, Shield, CheckCircle } from 'lucide-react';

interface PaymentData {
  txnid: string;
  amount: number;
  firstname: string;
  email: string;
  phone: string;
  productinfo: string;
  key: string;
  hash: string;
  surl: string;
  furl: string;
}

const PaymentGateway = () => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Retrieve payment data from localStorage
    const storedData = localStorage.getItem('payuData');
    const storedFormData = localStorage.getItem('payuFormData');
    
    if (storedData || storedFormData) {
      try {
        const parsedData = storedData ? JSON.parse(storedData) : {};
        const parsedFormData = storedFormData ? JSON.parse(storedFormData) : {};
        
        // Combine both data sources
        const completePaymentData = {
          ...parsedData,
          ...parsedFormData
        };
        
        // Ensure amount is stored as a number
        if (completePaymentData.amount) {
          completePaymentData.amount = typeof completePaymentData.amount === 'number' 
            ? completePaymentData.amount 
            : parseFloat(String(completePaymentData.amount));
        }
        
        // Validate required fields
        if (completePaymentData.txnid && completePaymentData.amount && completePaymentData.firstname) {
          setPaymentData(completePaymentData);
        } else {
          setError('Payment session expired. Please start a new donation.');
        }
      } catch (err) {
        console.error('Error parsing payment data:', err);
        setError('Invalid payment data. Please try again.');
      }
    } else {
      setError('Please start your donation from the donation page. This page requires payment data from a donation form.');
    }
  }, []);

  const handlePayUPayment = () => {
    if (!paymentData) return;
    
    setIsProcessing(true);
    
    // Create and submit form to PayU live gateway
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://secure.payu.in/_payment'; // Live PayU URL
    form.style.display = 'none';
    
    // Required PayU fields
    const formFields = {
      key: paymentData.key,
      txnid: paymentData.txnid,
      amount: String(paymentData.amount),
      productinfo: paymentData.productinfo,
      firstname: paymentData.firstname,
      email: paymentData.email,
      phone: paymentData.phone,
      hash: paymentData.hash,
      surl: paymentData.surl,
      furl: paymentData.furl,
    };
    
    // Create hidden inputs for all fields
    Object.entries(formFields).forEach(([key, value]) => {
      if (value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
    });
    
    document.body.appendChild(form);
    form.submit();
    
    // Clean up localStorage
    localStorage.removeItem('payuData');
    localStorage.removeItem('payuFormData');
  };

  const handleCancel = () => {
    localStorage.removeItem('payuData');
    localStorage.removeItem('payuFormData');
    navigate('/donate');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/donate')}>Return to Donation Page</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Helmet>
        <title>Secure Payment Gateway | ISKCON Juhu</title>
        <meta name="description" content="Secure payment gateway for ISKCON Juhu donations" />
      </Helmet>

      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/iskcon-logo.png" alt="ISKCON Logo" className="h-8 w-8" onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
              }} />
              <CardTitle>ISKCON Juhu</CardTitle>
            </div>
            <div className="rounded-full bg-white/20 px-3 py-1 text-sm flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Secure Payment
            </div>
          </div>
          <CardDescription className="text-primary-foreground/90">
            Complete your donation securely through PayU
          </CardDescription>
        </CardHeader>
        
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6 bg-gray-50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Order Summary
            </h3>
            <div className="text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium">{paymentData.txnid?.slice(0, 8)}...</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{paymentData.firstname}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-xs">{paymentData.email}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purpose:</span>
                <span className="font-medium text-xs">{paymentData.productinfo}</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between text-primary font-semibold text-lg">
                <span>Amount:</span>
                <span>₹{paymentData.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        
          <div className="md:w-2/3 p-6">
            {isProcessing ? (
              <div className="w-full py-16 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-center text-lg font-medium">Redirecting to PayU...</p>
                <p className="text-center text-sm text-muted-foreground mt-2">Please wait while we redirect you to the secure payment gateway</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You will be redirected to PayU's secure payment gateway where you can choose from:
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg flex flex-col items-center text-center hover:border-primary transition-colors">
                    <Phone className="h-8 w-8 text-primary mb-2" />
                    <span className="font-medium">UPI</span>
                    <span className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm</span>
                  </div>
                  
                  <div className="p-4 border rounded-lg flex flex-col items-center text-center hover:border-primary transition-colors">
                    <CreditCard className="h-8 w-8 text-primary mb-2" />
                    <span className="font-medium">Cards</span>
                    <span className="text-xs text-muted-foreground">Debit & Credit Cards</span>
                  </div>
                  
                  <div className="p-4 border rounded-lg flex flex-col items-center text-center hover:border-primary transition-colors">
                    <Wallet className="h-8 w-8 text-primary mb-2" />
                    <span className="font-medium">Wallets</span>
                    <span className="text-xs text-muted-foreground">Digital Wallets</span>
                  </div>
                  
                  <div className="p-4 border rounded-lg flex flex-col items-center text-center hover:border-primary transition-colors">
                    <Globe className="h-8 w-8 text-primary mb-2" />
                    <span className="font-medium">Net Banking</span>
                    <span className="text-xs text-muted-foreground">All Major Banks</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll be redirected to PayU's secure payment page</li>
                    <li>• Choose your preferred payment method</li>
                    <li>• Complete the payment using your banking app or card details</li>
                    <li>• Receive instant confirmation via WhatsApp</li>
                    <li>• Get your donation receipt automatically</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handlePayUPayment}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Proceed to Secure Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentGateway;