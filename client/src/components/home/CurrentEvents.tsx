import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Event } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

const CurrentEvents = () => {
  const [, setLocation] = useLocation();
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    staleTime: 5 * 60 * 1000,
  });

  const handleDonateClick = (eventId: number) => {
    // Redirect to event-specific donation page
    setLocation(`/donate/event/${eventId}`);
  };

  const toggleExpanded = (eventId: number) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };
  
  if (isLoading) {
    return (
      <section className="current-events-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          <div className="current-events-grid">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (events.length === 0) {
    return null;
  }
  
  return (
    <section className="current-events-section">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="current-events-title">Current Events</h1>
          <div className="title-underline"></div>
          <p className="current-events-subtitle">
            Join us for these special occasions and contribute to make them a success.
          </p>
        </div>

        {/* Events Grid */}
        <div className="current-events-grid">
          {events
            .filter(event => event.isActive)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 2)
            .map((event) => (
            <div key={event.id} className="current-event-card">
              {/* Event Image */}
              <div className="event-image-container">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="event-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Event Content */}
              <div className="event-content">
                <div className="event-header">
                  <h3 className="event-title">{event.title}</h3>
                  <span className="event-date">
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </span>
                </div>

                {/* Event Description with Read More */}
                <div className={`event-description-container ${expandedEvent === event.id ? "expanded" : ""}`}>
                  {!expandedEvent || expandedEvent !== event.id ? (
                    <p className="event-description-preview">
                      {event.description?.slice(0, 100) || ''}
                      {event.description && event.description.length > 100 && (
                        <span 
                          className="read-more-btn" 
                          onClick={() => toggleExpanded(event.id)}
                        >
                          Read More ➤
                        </span>
                      )}
                    </p>
                  ) : (
                    <div className="full-content">
                      <p className="event-description-full">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Suggested Amounts */}
                {event.suggestedAmounts && event.suggestedAmounts.length > 0 && (
                  <div className="suggested-amounts">
                    {event.suggestedAmounts.slice(0, 3).map((amount) => (
                      <span key={amount} className="amount-tag">
                        ₹{amount.toLocaleString('en-IN')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Donate Button */}
                <button 
                  className="donate-event-button"
                  onClick={() => handleDonateClick(event.id)}
                >
                  Donate for {event.title}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Events Button */}
        {events.filter(event => event.isActive).length > 2 && (
          <div className="text-center mt-12">
            <Link 
              href="/events"
              className="inline-block bg-secondary text-white font-poppins font-medium py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              View All Events
            </Link>
          </div>
        )}

        {/* Receipt Information & Tax Exemption Terms */}
        <div className="receipt-info bg-white p-6 rounded-xl border border-gray-100 shadow-xs mt-8">
          <h3 className="receipt-title font-bold text-lg text-primary mb-3">Receipts for your donation & Tax Exemption Terms</h3>
          <ul className="text-xs text-gray-700 space-y-2 list-disc list-outside pl-4 leading-relaxed font-opensans">
            <li>
              This donation receipt is an acknowledgement only and not for the purpose of claiming deduction under Section 133 of the Income-tax Act, 2025 (Previously 80G Deduction).
            </li>
            <li>
              Form No. 114 (10BE), Certificate of donation under the relevant provisions of Section 133 of the Income-tax Act, 2025, will be issued to you as per provisions of the Income-tax Act, 2025 and rules made thereunder.
            </li>
            <li>
              For all types of donations, irrespective of amount and mode of payment, full legal name and address with PIN are required. Further, PAN is compulsory to obtain Form No. 114 (10BE). Please ensure that the same are mentioned correctly in the donation receipt.
            </li>
            <li>Form No. 114 (10BE) is not available for any cash donation.</li>
            <li>
              Form No. 114 (10BE) will be available in PDF version only. Please ensure to mention correct WhatsApp number and E-mail ID to receive the same.
            </li>
            <li>PAN is compulsory for all donations of Rs. 50,000/- or more.</li>
            <li>In case of payment by cheque, this donation receipt is valid subject to clearance of the cheque.</li>
            <li>
              ISKCON's Unique Registration Number (URN) for donations eligible under Section 133 of the Income-tax Act, 2025 (previously Section 80G) is <b>AAATI0017P27MB02</b> – is valid till March 31, 2031 and is to be renewed thereafter periodically as per provisions of the Income-tax Act, 2025 and rules made thereunder.
            </li>
            <li>
              In case of any error/discrepancy in this receipt, including your Name, address, PAN, E-mail ID, WhatsApp number, etc., please contact the receipt-issuing centre for correction.
            </li>
            <li>Donations received on or after April 1, 2026 are governed by the Income-tax Act, 2025.</li>
          </ul>
        </div>

        {/* Support */}
        <div className="support-section text-center mt-6 p-4 bg-orange-50/60 rounded-xl border border-orange-100">
          <h3 className="font-bold text-base text-gray-900 mb-1">Donor Support & Inquiries</h3>
          <p className="text-sm text-gray-700">
            For more information please Call <b><a href="tel:+918369161527" className="text-primary hover:underline">+91-8369161527</a></b> from Monday to Saturday between 9:00am to 6:00pm
          </p>
        </div>
      </div>


    </section>
  );
};

export default CurrentEvents;
