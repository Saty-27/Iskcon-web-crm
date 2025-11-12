import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { DonationCategory, BankDetails } from '@shared/schema';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PaymentModal from '@/components/payment/PaymentModal';


const Donate = () => {
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    customAmount?: number;
    donationCategory?: DonationCategory;
  }>({
    isOpen: false
  });
  
  const [customAmount, setCustomAmount] = useState<string>('');

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<DonationCategory[]>({
    queryKey: ['/api/donation-categories'],
  });

  const { data: bankDetails = [] } = useQuery<BankDetails[]>({
    queryKey: ['/api/bank-details'],
  });

  const isLoading = categoriesLoading;

  // No authentication checks - allow donations without login

  // Handle category-based custom donation
  const handleCategoryDonation = (category: DonationCategory, amount: number) => {
    setPaymentModal({
      isOpen: true,
      customAmount: amount,
      donationCategory: category
    });
  };

  // Handle custom amount donation
  const handleCustomDonation = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0) {
      setPaymentModal({
        isOpen: true,
        customAmount: amount
      });
    }
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false });
  };
  
  return (
    <>
      <Helmet>
        <title>Donate - ISKCON Juhu</title>
        <meta name="description" content="Support ISKCON Juhu's initiatives including temple maintenance, food distribution, and spiritual education programs through your generous donations." />
        <meta property="og:title" content="Donate - ISKCON Juhu" />
        <meta property="og:description" content="Support ISKCON Juhu's initiatives through your generous donations. Your contributions help maintain the temple and support our spiritual and community services." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-primary">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl mb-4">
              Support Our Divine Mission
            </h1>
            <p className="text-white font-opensans text-lg md:text-xl max-w-3xl mx-auto">
              Your generosity enables us to maintain the temple, distribute prasadam to the needy,
              and spread spiritual knowledge throughout society.
            </p>
          </div>
        </section>
        
        {/* Donation Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
                Choose a Donation Category
              </h2>
              <p className="font-opensans text-lg max-w-2xl mx-auto text-dark">
                Select from our various donation categories to support different aspects of our mission.
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg">
                    <Skeleton className="w-full h-48" />
                    <div className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories
                  .filter(category => category.isActive)
                  .sort((a, b) => a.order - b.order)
                  .map((category) => (
                    <Link key={category.id} href={`/donate/${category.id}`}>
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform hover:transform hover:scale-105 cursor-pointer">
                        {/* Category Image */}
                        {category.imageUrl && (
                          <img 
                            src={category.imageUrl} 
                            alt={category.name}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        
                        <div className="p-6 text-center">
                          {/* Category Name */}
                          <h3 className="font-poppins font-semibold text-xl text-primary mb-3">
                            {category.name}
                          </h3>
                          
                          {/* Category Description */}
                          {category.description && (
                            <p className="font-opensans text-gray-600 text-sm mb-4 line-clamp-3">
                              {category.description}
                            </p>
                          )}
                          
                          {/* Donate Button */}
                          <Button className="w-full bg-primary text-white font-poppins font-medium py-3 rounded-lg hover:bg-opacity-90 transition-colors">
                            View Donation Options
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* Custom Amount Donation Section - Full Width */}
        <section className="py-16 bg-white">
          <div className="w-full px-4">
            <div className="max-w-6xl mx-auto bg-orange-50 p-8 rounded-xl border-2 border-primary">
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-primary mb-6 text-center">
                Custom Donation Amount
              </h2>
              <p className="font-opensans text-dark mb-6 text-center">
                Enter any amount you wish to donate for our temple services and community programs.
              </p>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <Label htmlFor="customAmount" className="text-primary font-semibold">
                    Enter Amount (₹)
                  </Label>
                  <Input
                    id="customAmount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter donation amount"
                    min="1"
                    className="mt-2 text-lg"
                  />
                </div>
                
                <Button 
                  onClick={handleCustomDonation}
                  disabled={!customAmount || parseInt(customAmount) <= 0}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-poppins font-medium py-3 text-lg"
                >
                  Donate Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bank Details Section */}
        {bankDetails.length > 0 && (
          <section className="py-16 bg-neutral">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
                  Alternative Payment Methods
                </h2>
                <p className="font-opensans text-lg max-w-2xl mx-auto text-dark">
                  You can also donate directly through bank transfer or UPI.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {bankDetails
                  .filter(bank => bank.isActive)
                  .map((bank) => (
                    <div key={bank.id} className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="font-poppins font-semibold text-xl text-primary mb-4">
                        Bank Transfer Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Bank Name:</strong> {bank.bankName}</p>
                        <p><strong>Account Name:</strong> {bank.accountName}</p>
                        <p><strong>Account Number:</strong> {bank.accountNumber}</p>
                        <p><strong>IFSC Code:</strong> {bank.ifscCode}</p>
                        {bank.swiftCode && (
                          <p><strong>Swift Code:</strong> {bank.swiftCode}</p>
                        )}
                      </div>
                      
                      {bank.qrCodeUrl && (
                        <div className="mt-6 text-center">
                          <h4 className="font-medium mb-3">Scan QR Code for UPI</h4>
                          <img 
                            src={bank.qrCodeUrl} 
                            alt="UPI QR Code" 
                            className="h-40 w-40 mx-auto border rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Tax Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-primary mb-6 text-center">
                Tax Benefits for Donors
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-poppins font-semibold text-xl mb-2">Tax Exemption Under 80G</h3>
                  <p className="font-opensans text-dark">
                    Donations made to ISKCON Juhu are eligible for tax exemption under Section 80G of the Income Tax Act.
                    You can claim a deduction of 50% of the donation amount from your taxable income.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-poppins font-semibold text-xl mb-2">How to Claim Tax Benefits</h3>
                  <ul className="list-disc list-inside font-opensans text-dark space-y-2">
                    <li>Make sure to provide your PAN details while making the donation</li>
                    <li>Keep the donation receipt safely for your records</li>
                    <li>Claim the deduction while filing your income tax return</li>
                    <li>For online donations, an acknowledgment will be sent to your registered email</li>
                  </ul>
                </div>
                
                <div className="bg-neutral p-4 rounded-lg">
                  <p className="font-opensans text-dark text-sm italic">
                    Note: For specific tax-related queries, we recommend consulting with your tax advisor or chartered accountant.
                    Tax benefits are subject to changes in the Income Tax Act provisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        customAmount={paymentModal.customAmount}
        donationCategory={paymentModal.donationCategory}
      />
    </>
  );
};

export default Donate;
