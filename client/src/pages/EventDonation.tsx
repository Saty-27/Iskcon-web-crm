import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from 'react-helmet';
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

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"]
  });

  const { data: eventDonationCards = [] } = useQuery<EventDonationCard[]>({
    queryKey: [`/api/events/${eventId}/donation-cards`],
    enabled: !!eventId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: bankDetails = [] } = useQuery<BankDetails[]>({
    queryKey: ["/api/bank-details"]
  });

  const event = events.find(e => e.id === parseInt(eventId || "0"));
  
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
      <Helmet>
        <title>{event.title} - Donate - ISKCON Juhu</title>
        <meta name="description" content={`Support ${event.title} at ISKCON Juhu. ${event.description}`} />
      </Helmet>
      
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
            padding: '20px', 
            borderRadius: '8px', 
            marginTop: '20px', 
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' 
          }}>
            <h3 style={{ marginBottom: '15px' }}>Receipts for your donation</h3>
            <p style={{ marginBottom: '10px' }}>
              Support {event.title} at ISKCON Juhu. Your donation helps us continue our sacred services.
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
          eventDonationCard={paymentModal.eventDonationCard}
          customAmount={paymentModal.customAmount}
          eventTitle={event.title}
        />
      )}
    </>
  );
}