import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CheckCircle, Download, Home, Receipt, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PaymentDetails {
  txnid: string;
  amount: string;
  firstname: string;
  email: string;
  status: string;
  purpose?: string;
  categoryName?: string;
}

const ThankYou = () => {
  const [location] = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Parse URL parameters from window.location.search
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    const details: PaymentDetails = {
      txnid: urlParams.get('txnid') || '',
      amount: urlParams.get('amount') || '',
      firstname: urlParams.get('firstname') || '',
      email: urlParams.get('email') || '',
      status: urlParams.get('status') || '',
      purpose: urlParams.get('purpose') || '',
      categoryName: urlParams.get('categoryName') || ''
    };

    // Set payment details even if some fields are missing for debugging
    if (details.txnid || details.amount || queryString) {
      setPaymentDetails(details);
    }
    
    // Fallback: try to get from URL hash or other sources
    if (!details.txnid && !details.amount) {
      // Check if parameters are in the location path for wouter
      const locationParts = location.split('?');
      if (locationParts.length > 1) {
        const fallbackParams = new URLSearchParams(locationParts[1]);
        const fallbackDetails: PaymentDetails = {
          txnid: fallbackParams.get('txnid') || '',
          amount: fallbackParams.get('amount') || '',
          firstname: fallbackParams.get('firstname') || '',
          email: fallbackParams.get('email') || '',
          status: fallbackParams.get('status') || '',
          purpose: fallbackParams.get('purpose') || '',
          categoryName: fallbackParams.get('categoryName') || ''
        };
        
        if (fallbackDetails.txnid || fallbackDetails.amount) {
          setPaymentDetails(fallbackDetails);
        }
      }
    }
  }, [location]);

  const handleDownloadReceipt = async () => {
    if (!paymentDetails?.txnid) return;
    
    setIsDownloading(true);
    try {
      // First, get the donation ID from the payment ID
      const donationResponse = await fetch(`/api/donations/by-payment-id/${paymentDetails.txnid}`);
      if (!donationResponse.ok) {
        throw new Error('Failed to find donation record');
      }
      
      const donation = await donationResponse.json();
      
      // Then download the receipt using the donation ID
      const response = await fetch(`/api/receipt/download/${donation.id}`);
      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ISKCON_Receipt_${donation.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Receipt Downloaded",
        description: "Your donation receipt has been downloaded successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!paymentDetails?.txnid) return;
    
    setIsSendingEmail(true);
    try {
      const response = await apiRequest('/api/payments/send-receipt', 'POST', {
        txnid: paymentDetails.txnid
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      toast({
        title: "Email Sent",
        description: "Receipt has been sent to your email address.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send receipt via email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">Loading payment details...</p>
            <Link href="/donate">
              <Button>Return to Donations</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Successful!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Thank you for your generous donation to ISKCON Juhu
          </p>
          {paymentDetails.categoryName && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 font-semibold text-lg">
                🙏 Your donation for "{paymentDetails.categoryName}" was successful!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Your contribution of ₹{paymentDetails.amount} will help support this noble cause.
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Transaction ID:</span>
                <p className="text-gray-800 font-mono">{paymentDetails.txnid}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Amount:</span>
                <p className="text-gray-800 text-lg font-semibold">₹{paymentDetails.amount}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Donor Name:</span>
                <p className="text-gray-800">{paymentDetails.firstname}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-800">{paymentDetails.email}</p>
              </div>
              
              {(paymentDetails.purpose || paymentDetails.categoryName) && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-600">Donation Purpose:</span>
                  <p className="text-gray-800 font-semibold text-orange-700">
                    {paymentDetails.categoryName || paymentDetails.purpose}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Receipt Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800">Receipt & Tax Benefits</h4>
                <p className="text-blue-700 text-sm mt-1 mb-3">
                  Your donation receipt will be sent to your WhatsApp and email within 5 minutes. 
                  This donation is eligible for tax deduction under Section 80G of the Income Tax Act.
                </p>
                
                {/* Receipt Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={handlePrint}
                    size="sm"
                    variant="outline"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print Page
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">🙏 Gratitude from ISKCON Juhu</h4>
              <p className="text-orange-700 text-sm">
                Your generous contribution helps us continue our spiritual and community service. 
                May Lord Krishna bless you abundantly for your devotion and generosity.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="default" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
              
              <Link href="/donate">
                <Button variant="outline" className="w-full sm:w-auto">
                  Make Another Donation
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center text-sm text-gray-600 pt-4 border-t">
            <p>For any queries regarding your donation, please contact:</p>
            <p className="font-medium">Email: donations@iskconjuhu.org | Phone: +91-22-2620-6860</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;