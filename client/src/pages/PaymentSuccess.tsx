import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'wouter';
import { CheckCircle, Download, Home, IndianRupee, Printer, Calendar, MapPin, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';

interface DonationDetails {
  donation: any;
  user: any;
  type?: 'event' | 'category';
  event?: any;
  category?: any;
  card?: any;
}

const PaymentSuccess = () => {
  const [location] = useLocation();
  const [txnid, setTxnid] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('txnid');
    console.log('PaymentSuccess - Transaction ID:', transactionId);
    setTxnid(transactionId);
  }, [location]);

  const { data: donationDetails, isLoading, error } = useQuery<DonationDetails>({
    queryKey: [`/api/donation/${txnid}`],
    enabled: !!txnid,
  });

  console.log('PaymentSuccess Debug:', { txnid, isLoading, error, donationDetails });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printContent = document.getElementById('donation-receipt');
    if (printContent) {
      const newWindow = window.open('', '_blank');
      newWindow?.document.write(`
        <html>
          <head>
            <title>Donation Receipt - ISKCON Juhu</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt { max-width: 600px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .flex { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .amount { font-size: 24px; font-weight: bold; color: #f97316; }
            </style>
          </head>
          <body>${printContent.innerHTML}</body>
        </html>
      `);
      newWindow?.print();
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading donation details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || (!isLoading && !donationDetails)) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center p-8">
              <p className="text-gray-600">Unable to load donation details. Please contact support.</p>
              {error && (
                <p className="text-red-600 text-sm mt-2">
                  Error: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              )}
              <div className="mt-4 text-xs text-gray-500">
                Transaction ID: {txnid}
              </div>
              <Link href="/">
                <Button className="mt-4">Return Home</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  if (!donationDetails) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading donation details...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { donation, user, type, event, category, card } = donationDetails;

  return (
    <>
      <Helmet>
        <title>Payment Successful - ISKCON Juhu</title>
        <meta name="description" content="Your donation has been successfully processed. Thank you for supporting ISKCON Juhu." />
      </Helmet>
      
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <Card className="text-center mb-8">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-poppins text-green-600">
                  Payment Successful!
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Thank you for your generous donation to ISKCON Juhu
                </p>
              </CardHeader>
            </Card>

            {/* Donation Receipt */}
            <Card id="donation-receipt" className="mb-8">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                <div className="text-center">
                  <CardTitle className="text-2xl font-poppins text-primary mb-2">
                    Donation Receipt
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    International Society for Krishna Consciousness (ISKCON) Juhu
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-6">
                {/* Transaction Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Transaction Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-sm font-medium">{donation.paymentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span>{new Date(donation.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Successful
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donor Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Donor Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{donation.name}</span>
                      </div>
                      {user?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      {donation.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{donation.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Donation Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Donation Details
                  </h3>
                  
                  {type === 'event' && event && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">Event Donation</h4>
                      </div>
                      <p className="text-blue-700 font-medium">{event.title}</p>
                      {event.description && <p className="text-blue-600 text-sm mt-1">{event.description}</p>}
                      {card && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="font-medium">{card.title}</p>
                          {card.description && <p className="text-sm text-gray-600">{card.description}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {type === 'category' && category && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold text-orange-800">Category Donation</h4>
                      </div>
                      <p className="text-orange-700 font-medium">{category.name}</p>
                      {category.description && <p className="text-orange-600 text-sm mt-1">{category.description}</p>}
                      {card && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="font-medium">{card.title}</p>
                          {card.description && <p className="text-sm text-gray-600">{card.description}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {donation.message && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Personal Message:</h4>
                      <p className="text-gray-700 italic">"{donation.message}"</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Amount Section */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Amount</h3>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary">
                      <IndianRupee className="w-8 h-8" />
                      <span>{donation.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-gray-600 mt-2">Amount Donated</p>
                  </div>
                </div>

                {/* Thank You Note */}
                <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-primary">
                  <h3 className="font-poppins font-semibold text-primary mb-3">🙏 Thank You for Your Generosity</h3>
                  <p className="text-gray-700 mb-3">
                    Your contribution will help us continue our spiritual and community services. 
                    May Lord Krishna bless you and your family with happiness, health, and prosperity.
                  </p>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">• You will receive an email confirmation shortly</p>
                    <p className="mb-1">• Your donation receipt is available for download/print</p>
                    <p>• For queries, contact: donations@iskconjuhu.org</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handlePrint}
                className="flex-1 max-w-xs"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Receipt
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleDownload}
                className="flex-1 max-w-xs"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Receipt
              </Button>
              <Link href="/" className="flex-1 max-w-xs">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default PaymentSuccess;