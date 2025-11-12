import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { XCircle, Home, RefreshCw, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FailureDetails {
  txnid: string;
  amount: string;
  firstname: string;
  email: string;
  error: string;
}

const PaymentFailed = () => {
  const [location] = useLocation();
  const [failureDetails, setFailureDetails] = useState<FailureDetails | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const details: FailureDetails = {
      txnid: urlParams.get('txnid') || '',
      amount: urlParams.get('amount') || '',
      firstname: urlParams.get('firstname') || '',
      email: urlParams.get('email') || '',
      error: urlParams.get('error') || 'Payment was not completed'
    };

    setFailureDetails(details);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            Payment Failed
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your payment could not be processed. Don't worry, no amount has been deducted.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Failure Details */}
          {failureDetails && failureDetails.txnid && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3">Transaction Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Transaction ID:</span>
                  <p className="text-gray-800 font-mono">{failureDetails.txnid}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Amount:</span>
                  <p className="text-gray-800 text-lg font-semibold">₹{failureDetails.amount}</p>
                </div>
                
                {failureDetails.firstname && (
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <p className="text-gray-800">{failureDetails.firstname}</p>
                  </div>
                )}
                
                {failureDetails.error && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Reason:</span>
                    <p className="text-red-600">{failureDetails.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Reasons */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Common Reasons for Payment Failure:</h4>
            <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
              <li>Insufficient balance in bank account or card</li>
              <li>Internet connection issues during payment</li>
              <li>Bank server temporarily unavailable</li>
              <li>Incorrect payment details entered</li>
              <li>Transaction timeout or session expired</li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">What You Can Do:</h4>
            <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
              <li>Check your bank balance and try again</li>
              <li>Ensure stable internet connection</li>
              <li>Try a different payment method (UPI, Card, Net Banking)</li>
              <li>Contact your bank if the issue persists</li>
              <li>Try the payment after some time</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/donate">
                <Button variant="default" className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Payment Again
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">Need Help?</h4>
            <p className="text-orange-700 text-sm mb-3">
              If you continue facing issues with payment, please contact our support team:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-sm">
              <div className="flex items-center text-orange-700">
                <Phone className="w-4 h-4 mr-2" />
                <span>+91-22-2620-6860</span>
              </div>
              <div className="flex items-center text-orange-700">
                <Mail className="w-4 h-4 mr-2" />
                <span>donations@iskconjuhu.org</span>
              </div>
            </div>
          </div>

          {/* Reassurance */}
          <div className="text-center text-sm text-gray-600 pt-4 border-t">
            <p className="font-medium text-gray-800 mb-1">🙏 Your intention to donate is appreciated</p>
            <p>No amount has been deducted from your account. You can safely try again.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;