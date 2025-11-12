import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { Event } from '@shared/schema';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, Clock, MapPin } from 'lucide-react';

const Events = () => {
  const [, setLocation] = useLocation();
  
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  const handleDonateClick = (eventId: number) => {
    setLocation(`/donate/event/${eventId}`);
  };
  
  return (
    <>
      <Helmet>
        <title>Events - ISKCON Juhu</title>
        <meta name="description" content="Join us for divine celebrations, festivals, special events, and spiritual gatherings at ISKCON Juhu. Check our upcoming events calendar." />
        <meta property="og:title" content="Events - ISKCON Juhu" />
        <meta property="og:description" content="Join us for divine celebrations, festivals, special events, and spiritual gatherings at ISKCON Juhu." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-primary">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl mb-4">
              Divine Celebrations & Events
            </h1>
            <p className="text-white font-opensans text-lg md:text-xl max-w-3xl mx-auto">
              Join us for auspicious celebrations, festivals, and spiritual programs 
              throughout the year. Your participation and support make these events successful.
            </p>
          </div>
        </section>
        
        {/* Special Events */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
                Special Events & Celebrations
              </h2>
              <p className="font-opensans text-lg max-w-2xl mx-auto text-dark">
                Join us for these upcoming special occasions and contribute to make them a success.
              </p>
            </div>
            
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-neutral rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
                    <Skeleton className="h-64 md:h-auto md:w-1/3" />
                    <div className="p-6 md:w-2/3">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-6 w-24 rounded" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex items-center mb-4">
                        <Skeleton className="h-6 w-6 rounded-full mr-2" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[1, 2, 3].map((j) => (
                          <Skeleton key={j} className="h-8 w-16 rounded-full" />
                        ))}
                      </div>
                      <Skeleton className="h-10 w-full md:w-1/3 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="font-poppins font-semibold text-xl text-gray-500 mb-2">No Events Currently Scheduled</h3>
                <p className="font-opensans text-gray-500">
                  Please check back later for upcoming events.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 flex flex-col md:flex-row"
                  >
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="h-64 md:h-auto md:w-1/3 object-cover"
                    />
                    <div className="p-6 md:w-2/3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-poppins font-bold text-2xl text-gray-900">{event.title}</h3>
                        <span className="bg-orange-500 text-white text-sm font-poppins py-1 px-2 rounded">
                          {format(new Date(event.date), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      <p className="font-opensans text-gray-700 mb-4">{event.description}</p>
                      
                      <div className="flex items-center mb-4">
                        <MapPin className="text-orange-500 mr-2" size={18} />
                        <span className="text-gray-700">ISKCON Temple, Juhu, Mumbai</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.suggestedAmounts?.map((amount) => (
                          <button 
                            key={amount}
                            onClick={() => handleDonateClick(event.id)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-full transition-colors border border-gray-300"
                          >
                            ₹{amount.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => handleDonateClick(event.id)}
                        className="bg-purple-600 text-white font-poppins font-medium py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Donate for {event.title}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Calendar/Regular Events */}
        <section className="py-16 bg-neutral">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
                Regular Temple Programs
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-poppins font-semibold text-xl text-primary mb-4">Daily Programs</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Clock className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-poppins font-medium">Mangala Aarti</p>
                      <p className="text-sm text-gray-600">4:30 AM</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Clock className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-poppins font-medium">Deity Darshan</p>
                      <p className="text-sm text-gray-600">7:15 AM - 11:00 AM</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Clock className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-poppins font-medium">Evening Aarti</p>
                      <p className="text-sm text-gray-600">7:00 PM</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Clock className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-poppins font-medium">Shayan Aarti</p>
                      <p className="text-sm text-gray-600">8:30 PM</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-poppins font-semibold text-xl text-primary mb-4">Weekly Programs</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CalendarIcon className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-poppins font-medium">Sunday Feast</p>
                      <p className="text-sm text-gray-600">Sunday, 6:00 PM - 9:00 PM</p>
                      <p className="text-sm">Spiritual discourse, bhajans, and prasadam</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CalendarIcon className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-poppins font-medium">Bhagavad Gita Class</p>
                      <p className="text-sm text-gray-600">Wednesday, 7:00 PM</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CalendarIcon className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-poppins font-medium">Youth Program</p>
                      <p className="text-sm text-gray-600">Saturday, 5:00 PM</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      

    </>
  );
};

export default Events;
