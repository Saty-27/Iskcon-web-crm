import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEO from "@/components/seo/SEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Event, EventDonationCard, BankDetails } from "@shared/schema";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PaymentModal from '@/components/payment/PaymentModal';

export default function EventDonation() {
  const { eventId } = useParams();
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    eventDonationCard?: EventDonationCard;
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

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  const { data: eventDonationCards = [], isLoading: cardsLoading } = useQuery<EventDonationCard[]>({
    queryKey: [`/api/events/${eventId}/donation-cards`],
    enabled: !!eventId,
  });

  const { data: bankDetails = [] } = useQuery<BankDetails[]>({
    queryKey: [`/api/events/${eventId}/bank-details`],
    enabled: !!eventId,
  });
  
  // Filter event donation cards to show only active ones
  const activeEventDonationCards = eventDonationCards.filter(card => card.isActive);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedPrice(value === '' ? '' : value);
  };

  // Handle event donation card click - open payment modal
  const handleEventDonateClick = (card: EventDonationCard) => {
    setPaymentModal({
      isOpen: true,
      eventDonationCard: card
    });
  };

  // Handle custom amount donation for events
  const handleCustomEventDonation = () => {
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

  const currentBankDetail = bankDetails[0];

  if (eventLoading || cardsLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading festival details...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">Event not found</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${event.title} - Festival Seva & Donation | ISKCON Juhu`}
        description={`Sponsor and contribute to ${event.title} at ISKCON Juhu, Mumbai. ${event.description || 'Participate in divine festival sevas with 80G tax benefits.'}`}
        keywords={`${event.title}, ISKCON Juhu Festival, Janmashtami Seva, Mumbai Temple Festival Donation, 80G Tax Exemption`}
        ogImage={event.imageUrl}
        schemaType="donation"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Events & Festivals', url: '/events' },
          { name: event.title, url: `/donate/event/${event.id}` },
        ]}
      />
      
      <Header />
      
      <main style={{ padding: '0', backgroundColor: '#F5F3F3', color: '#333', minHeight: '100vh' }}>
        <div style={{ width: '100%', padding: '20px' }}>
          {/* Title */}
          <h1 style={{ textAlign: 'left', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            {event.title}
          </h1>
          
          {/* Title Underline */}
          <div style={{ 
            width: '100px', 
            height: '4px', 
            backgroundColor: '#faa817', 
            margin: '0 0 20px 0', 
            borderRadius: '2px' 
          }}></div>

          {/* Event Information Section */}
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
                  {event.title}
                </h2>
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6', 
                  marginBottom: '20px',
                  color: '#f0f0f0'
                }}>
                  {event.description && getWordCount(event.description) > 25 
                    ? getTruncatedDescription(event.description, 25)
                    : event.description}
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
                      <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-6">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {event.description}
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
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  style={{ 
                    width: '100%', 
                    height: '250px', 
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Donation Options Title */}
          <h2 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'left' }}>
            Donate for {event.title}
          </h2>

          {/* Donation Cards */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            {activeEventDonationCards.length > 0 ? activeEventDonationCards.map((card) => (
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
                  onClick={() => handleEventDonateClick(card)}
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
                <p>No donation cards available for this event</p>
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
              Any Donation of Your Choice for {event.title}
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
                onClick={handleCustomEventDonation}
                disabled={!customAmount || parseInt(customAmount) <= 0}
              >
                Donate
              </button>
            </div>
          </div>



          {/* Receipt Information */}
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '24px', 
            borderRadius: '12px', 
            marginTop: '24px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ marginBottom: '12px', color: '#B45309', fontWeight: 700, fontSize: '18px' }}>
              Receipts for your donation & Tax Exemption Terms
            </h3>
            <ul style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7', paddingLeft: '18px', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '6px' }}>
                This donation receipt is an acknowledgement only and not for the purpose of claiming deduction under Section 133 of the Income-tax Act, 2025 (Previously 80G Deduction).
              </li>
              <li style={{ marginBottom: '6px' }}>
                Form No. 114 (10BE), Certificate of donation under the relevant provisions of Section 133 of the Income-tax Act, 2025, will be issued to you as per provisions of the Income-tax Act, 2025 and rules made thereunder.
              </li>
              <li style={{ marginBottom: '6px' }}>
                For all types of donations, irrespective of amount and mode of payment, full legal name and address with PIN are required. Further, PAN is compulsory to obtain Form No. 114 (10BE). Please ensure that the same are mentioned correctly in the donation receipt.
              </li>
              <li style={{ marginBottom: '6px' }}>Form No. 114 (10BE) is not available for any cash donation.</li>
              <li style={{ marginBottom: '6px' }}>
                Form No. 114 (10BE) will be available in PDF version only. Please ensure to mention correct WhatsApp number and E-mail ID to receive the same.
              </li>
              <li style={{ marginBottom: '6px' }}>PAN is compulsory for all donations of Rs. 50,000/- or more.</li>
              <li style={{ marginBottom: '6px' }}>In case of payment by cheque, this donation receipt is valid subject to clearance of the cheque.</li>
              <li style={{ marginBottom: '6px' }}>
                ISKCON's Unique Registration Number (URN) for donations eligible under Section 133 of the Income-tax Act, 2025 (previously Section 80G) is <strong>AAATI0017P27MB02</strong> – is valid till March 31, 2031 and is to be renewed thereafter periodically as per provisions of the Income-tax Act, 2025 and rules made thereunder.
              </li>
              <li style={{ marginBottom: '6px' }}>
                In case of any error/discrepancy in this receipt, including your Name, address, PAN, E-mail ID, WhatsApp number, etc., please contact the receipt-issuing centre for correction.
              </li>
              <li>Donations received on or after April 1, 2026 are governed by the Income-tax Act, 2025.</li>
            </ul>
          </div>

          {/* Support */}
          <div style={{ marginTop: '20px', textAlign: 'center', padding: '16px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FEF3C7' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: '#1F2937' }}>Donor Support</h3>
            <p style={{ fontSize: '14px', color: '#4B5563', margin: 0 }}>
              For more information please Call <strong><a href="tel:+918369161527" style={{ color: '#D97706', textDecoration: 'none' }}>+91-8369161527</a></strong> from Monday to Saturday between 9:00am to 6:00pm
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
          eventDonationCard={paymentModal.eventDonationCard}
          customAmount={paymentModal.customAmount}
          eventTitle={event.title}
        />
      )}
    </>
  );
}