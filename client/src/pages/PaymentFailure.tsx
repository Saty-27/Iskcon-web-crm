import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'wouter';
import { XCircle, RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PaymentFailure = () => {
  const [location] = useLocation();
  const [errorDetails, setErrorDetails] = useState<{
    txnid: string | null;
    error: string | null;
  }>({ txnid: null, error: null });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const txnid = urlParams.get('txnid');
    const error = urlParams.get('error');
    
    setErrorDetails({ txnid, error });
  }, [location]);

  const getErrorMessage = () => {
    switch (errorDetails.error) {
      case 'payment_failed':
        return 'Your payment could not be processed. Please try again or use a different payment method.';
      case 'payment_cancelled':
        return 'Payment was cancelled. You can try again when ready.';
      case 'verification_failed':
        return 'Payment verification failed for security reasons. Please contact support.';
      case 'processing_error':
        return 'There was an error processing your payment. Please try again.';
      default:
        return 'Your payment could not be completed. Please try again.';
    }
  };

  const getErrorIcon = () => {
    if (errorDetails.error === 'payment_cancelled') {
      return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
    }
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  const getErrorColor = () => {
    if (errorDetails.error === 'payment_cancelled') {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  const getErrorBgColor = () => {
    if (errorDetails.error === 'payment_cancelled') {
      return 'bg-yellow-100';
    }
    return 'bg-red-100';
  };

  return (
    <>
      <Helmet>
        <title>Payment Failed - ISKCON Juhu</title>
        <meta name="description" content="Payment could not be processed. Please try again or contact support." />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className={`mx-auto w-16 h-16 ${getErrorBgColor()} rounded-full flex items-center justify-center mb-4`}>
                  {getErrorIcon()}
                </div>
                <CardTitle className={`text-2xl font-poppins ${getErrorColor()}`}>
                  {errorDetails.error === 'payment_cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  {getErrorMessage()}
                </p>
                
                {errorDetails.txnid && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-sm font-medium">{errorDetails.txnid}</span>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-poppins font-semibold text-blue-700 mb-2">What can you do?</h3>
                  <ul className="text-sm text-blue-600 space-y-1 text-left">
                    <li>• Check your internet connection and try again</li>
                    <li>• Ensure your payment details are correct</li>
                    <li>• Try using a different payment method</li>
                    <li>• Contact your bank if the issue persists</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/donate" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    If you continue to experience issues, please contact our support team:
                  </p>
                  <div className="text-sm space-y-1">
                    <p><strong>Email:</strong> donations@iskconjuhu.org</p>
                    <p><strong>Phone:</strong> +91 22 2620 6860</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default PaymentFailure;