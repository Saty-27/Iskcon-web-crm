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

        {/* Receipt Information */}
        <div className="receipt-info">
          <h3 className="receipt-title">Receipts for your donation</h3>
          <p>
            80G available as per Income Tax Act 1961 and rules made thereunder.
            Tax Exemption Certificate Ref. No.: AAATI0017PF20219
          </p>
          <p>
            To get the receipt of donation made through NEFT, RTGS, IMPS PayTm,
            UPI as mentioned above, please share your legal name, postal address
            with pincode (and PAN if you need 80G receipt) along with transaction
            details on pranav@iskcontrust.org
          </p>
        </div>

        {/* Support */}
        <div className="support-section">
          <h3>Support</h3>
          <p>
            For more information please Call <b>+91-6263756519</b> from Monday to
            Saturday between 9:00am to 6:00pm
          </p>
        </div>
      </div>


    </section>
  );
};

export default CurrentEvents;
