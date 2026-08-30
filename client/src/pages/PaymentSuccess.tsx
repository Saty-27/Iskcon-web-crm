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
import OfficialDonationReceipt from '@/components/donation/OfficialDonationReceipt';

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!donationDetails?.donation) return;
    setIsDownloading(true);
    try {
      const donationId = donationDetails.donation.id;
      const downloadTxnid = donationDetails.donation.paymentId || txnid || '';
      const url = `/api/receipt/download/${donationId}?txnid=${encodeURIComponent(downloadTxnid)}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `Donation_Receipt_${donationDetails.donation.invoiceNumber || donationDetails.donation.id || 'ISKCON'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('PDF download error:', err);
      const donationId = donationDetails.donation.id;
      const downloadTxnid = donationDetails.donation.paymentId || txnid || '';
      window.open(`/api/receipt/download/${donationId}?txnid=${encodeURIComponent(downloadTxnid)}`, '_blank');
    } finally {
      setIsDownloading(false);
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

  const purpose = event?.title || category?.name || card?.title || donation.message || 'General Donation / Seva';
  
  // Parse mode from payment gateway response
  let rawMode: string | null = null;
  if (donation.paymentGatewayResponse) {
    try {
      const parsed = typeof donation.paymentGatewayResponse === 'string' ? JSON.parse(donation.paymentGatewayResponse) : donation.paymentGatewayResponse;
      rawMode = parsed.mode || parsed.bankcode || null;
    } catch (_) {}
  }

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
            <Card className="text-center mb-8 print-hide">
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

            {/* Official Donation Receipt */}
            <div className="mb-8">
              <OfficialDonationReceipt
                donation={{
                  ...donation,
                  email: donation.email || user?.email,
                }}
                purpose={purpose}
                paymentMode={rawMode || 'UPI'}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto pt-3 pb-6">
              <Button 
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 min-w-[200px] sm:min-w-[220px] bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm sm:text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5 mr-2" />
                {isDownloading ? 'Generating PDF...' : 'Download Receipt PDF'}
              </Button>

              <Button 
                size="lg"
                variant="outline"
                onClick={handlePrint}
                className="flex-1 min-w-[160px] border-2 border-orange-500 text-orange-700 bg-white hover:bg-orange-50 font-semibold text-sm sm:text-base py-6 rounded-xl shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
              >
                <Printer className="w-5 h-5 mr-2 text-orange-600" />
                Print Receipt
              </Button>

              <Link href="/" className="flex-1 min-w-[160px]">
                <Button 
                  size="lg" 
                  className="w-full bg-gray-900 hover:bg-black text-white font-semibold text-sm sm:text-base py-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
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