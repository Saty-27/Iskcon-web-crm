import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from 'react-helmet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { DonationCategory, DonationCard, BankDetails } from "@shared/schema";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PaymentModal from '@/components/payment/PaymentModal';

export default function CategoryDonation() {
  const { categoryId } = useParams();
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    donationCard?: DonationCard;
    customAmount?: number;
  }>({
    isOpen: false
  });
  const [customAmount, setCustomAmount] = useState<string>('');

  // Helper function to count words
  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Helper function to get truncated description
  const getTruncatedDescription = (text: string, wordLimit: number): string => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Fetch category data
  const { data: category, isLoading: categoryLoading } = useQuery<DonationCategory>({
    queryKey: [`/api/donation-categories/${categoryId}`],
    enabled: !!categoryId,
  });

  // Fetch donation cards for this category with better caching
  const { data: donationCards = [], isLoading: cardsLoading } = useQuery<DonationCard[]>({
    queryKey: [`/api/donation-cards/category/${categoryId}`],
    enabled: !!categoryId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch category-specific bank details
  const { data: bankDetails = [] } = useQuery<BankDetails[]>({
    queryKey: [`/api/categories/${categoryId}/bank-details`],
    enabled: !!categoryId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Filter donation cards to show only active ones
  const activeDonationCards = donationCards.filter(card => card.isActive);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedPrice(value === '' ? '' : value);
  };

  // Handle donation card click - open payment modal directly (no auth check)
  const handleDonateClick = (card: DonationCard) => {
    setPaymentModal({
      isOpen: true,
      donationCard: card
    });
  };

  // Handle custom amount donation (no auth check)
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

  const currentBankDetail = bankDetails[0]; // Use first bank detail

  if (categoryLoading || cardsLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">Category not found</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} - Donate - ISKCON Juhu</title>
        <meta name="description" content={`Support ${category.name} at ISKCON Juhu. ${category.description}`} />
      </Helmet>
      
      <Header />
      
      <main style={{ padding: '0', backgroundColor: '#F5F3F3', color: '#333', minHeight: '100vh' }}>
        <div style={{ width: '100%', padding: '20px' }}>
          {/* Title */}
          <h1 style={{ textAlign: 'left', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            {category.name}
          </h1>
          
          {/* Title Underline */}
          <div style={{ 
            width: '100px', 
            height: '4px', 
            backgroundColor: '#faa817', 
            margin: '0 0 20px 0', 
            borderRadius: '2px' 
          }}></div>

          {/* Category Information Section */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              flex: '1',
              minWidth: '300px',
              background: 'linear-gradient(135deg, #8B5A96 0%, #B68CB8 100%)',
              color: '#fff',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}>
              {/* Dark overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '15px',
                zIndex: 1
              }}></div>
              {/* Content above overlay */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  color: '#fff'
                }}>
                  {category.name}
                </h2>
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6', 
                  marginBottom: '20px',
                  color: '#f0f0f0'
                }}>
                  {category.description && getWordCount(category.description) > 25 
                    ? getTruncatedDescription(category.description, 25)
                    : category.description}
                </p>
                <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
                  <DialogTrigger asChild>
                    <button style={{ 
                      backgroundColor: '#faa817', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '10px 20px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      Read More
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">{category.name}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-6">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {category.description}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div style={{ 
              flex: '1',
              minWidth: '300px'
            }}>
              <div style={{ 
                borderRadius: '15px', 
                overflow: 'hidden',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)'
              }}>
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    style={{ 
                      width: '100%', 
                      height: '250px', 
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '250px', 
                    backgroundColor: '#ddd', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#666'
                  }}>
                    No Image Available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Donation Options Title */}
          <h2 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'left' }}>
            Donate for {category.name}
          </h2>

          {/* Donation Cards */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            {activeDonationCards.length > 0 ? activeDonationCards.map((card) => (
              <div key={card.id} style={{ 
                backgroundColor: '#fff', 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                flex: '1 1 calc(25% - 20px)', 
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                minWidth: '200px'
              }}>
                <p style={{ 
                  fontSize: '16px', 
                  marginBottom: '10px', 
                  fontWeight: 'bold' 
                }}>
                  {card.title}
                </p>
                <p style={{ 
                  color: '#faa817', 
                  marginBottom: '10px', 
                  fontSize: '18px', 
                  fontWeight: 'bold' 
                }}>
                  ₹{card.amount.toLocaleString()}
                </p>
                {card.description && (
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666', 
                    marginBottom: '10px' 
                  }}>
                    {card.description}
                  </p>
                )}
                <button 
                  onClick={() => handleDonateClick(card)}
                  style={{ 
                    backgroundColor: '#faa817', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '10px 15px', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    width: '100%' 
                  }}
                >
                  Add Donation
                </button>
              </div>
            )) : (
              <div style={{ 
                textAlign: 'center', 
                backgroundColor: '#fff', 
                padding: '40px', 
                borderRadius: '8px', 
                width: '100%' 
              }}>
                <p>No donation cards available for this category</p>
              </div>
            )}
          </div>

          {/* Custom Donation */}
          <div style={{ 
            background: 'white', 
            borderRadius: '10px', 
            padding: '30px', 
            marginTop: '20px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            width: '100%'
          }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'left' }}>
              Any Donation of Your Choice for {category.name}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', alignItems: 'center', width: '100%' }}>
              <input 
                type="number" 
                style={{ 
                  flex: '1', 
                  width: '100%',
                  borderRadius: '5px', 
                  border: '1px solid #ddd', 
                  height: '50px', 
                  fontSize: '18px', 
                  padding: '10px' 
                }} 
                value={customAmount} 
                onChange={(e) => setCustomAmount(e.target.value)} 
                placeholder="Enter the Amount"
              />
              <button 
                style={{ 
                  backgroundColor: '#faa817', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '15px 25px', 
                  borderRadius: '5px', 
                  cursor: 'pointer', 
                  fontSize: '18px' 
                }} 
                onClick={handleCustomDonation}
                disabled={!customAmount || parseInt(customAmount) <= 0}
              >
                Donate
              </button>
            </div>
          </div>

          {/* Account Details and UPI - only show if available */}
          {currentBankDetail && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '30px', 
              gap: '20px' 
            }}>
              <div style={{ 
                flex: 1, 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' 
              }}>
                <h3 style={{ marginBottom: '15px' }}>Account Details</h3>
                <p style={{ marginBottom: '8px' }}>Bank Name: {currentBankDetail.bankName}</p>
                <p style={{ marginBottom: '8px' }}>Account Name: {currentBankDetail.accountName}</p>
                <p style={{ marginBottom: '8px' }}>Account Number: {currentBankDetail.accountNumber}</p>
                <p style={{ marginBottom: '8px' }}>IFSC Code: {currentBankDetail.ifscCode}</p>
              </div>
              
              <div style={{ 
                flex: 1, 
                textAlign: 'center', 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' 
              }}>
                <h3 style={{ marginBottom: '15px' }}>Donate through UPI</h3>
                {currentBankDetail.qrCodeUrl ? (
                  <img 
                    src={currentBankDetail.qrCodeUrl} 
                    alt="QR Code" 
                    style={{ height: '200px', width: '200px', objectFit: 'contain' }}
                  />
                ) : (
                  <p>QR Code not available</p>
                )}
              </div>
            </div>
          )}

          {/* Receipt Information */}
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '8px', 
            marginTop: '20px', 
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '15px' }}>Receipts for your donation</h3>
            <p style={{ marginBottom: '10px' }}>
              Support {category.name} at ISKCON Juhu. Your donation helps us continue our sacred services.
            </p>
            <p style={{ marginBottom: '10px' }}>
              80G available as per Income Tax Act 1961 and rules made thereunder.
            </p>
            <p>
              To get the receipt of donation, please share your details with our team.
            </p>
          </div>

          {/* Support */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Support</h3>
            <p style={{ fontSize: '14px' }}>
              For more information please contact us for assistance.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={closePaymentModal}
          donationCard={paymentModal.donationCard}
          customAmount={paymentModal.customAmount}
          categoryTitle={category.name}
        />
      )}
    </>
  );
}