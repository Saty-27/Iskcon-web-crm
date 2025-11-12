import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - ISKCON Juhu</title>
        <meta name="description" content="Get in touch with ISKCON Juhu temple. Find our location, contact details, and temple hours. Send us a message for inquiries or spiritual guidance." />
        <meta property="og:title" content="Contact Us - ISKCON Juhu" />
        <meta property="og:description" content="Get in touch with ISKCON Juhu temple. Find our location, contact details, and temple hours." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-primary">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl mb-4">
              Contact Us
            </h1>
            <p className="text-white font-opensans text-lg md:text-xl max-w-3xl mx-auto">
              We'd love to hear from you. Reach out for inquiries, spiritual guidance, or to connect with our community.
            </p>
          </div>
        </section>
        
        {/* Map Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-poppins font-bold text-3xl text-primary mb-8 text-center">
                Our Location
              </h2>
              
              <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.0325769041636!2d72.82668371490201!3d19.10868708706481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9b88e140445%3A0x23c49a0eeeedf40e!2sISKCON%20Temple%2C%20Juhu!5e0!3m2!1sen!2sin!4v1626873550656!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  title="ISKCON Juhu Temple Location"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
        
        {/* Visit Information */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-poppins font-bold text-3xl text-primary mb-8 text-center">
                Visiting Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-neutral p-6 rounded-xl shadow-md">
                  <div className="w-14 h-14 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                    <i className="ri-time-fill text-white text-2xl"></i>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-primary mb-2 text-center">Visiting Hours</h3>
                  <ul className="space-y-2 font-opensans">
                    <li><strong>Darshan Hours:</strong> 4:30 AM to 9:00 PM</li>
                    <li><strong>Morning Arti:</strong> 4:30 AM</li>
                    <li><strong>Evening Arti:</strong> 7:00 PM</li>
                    <li><strong>Office Hours:</strong> 9:00 AM to 5:00 PM</li>
                    <li className="text-sm italic">Special timings during festivals</li>
                  </ul>
                </div>
                
                <div className="bg-neutral p-6 rounded-xl shadow-md">
                  <div className="w-14 h-14 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                    <i className="ri-route-fill text-white text-2xl"></i>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-primary mb-2 text-center">Getting Here</h3>
                  <ul className="space-y-2 font-opensans">
                    <li><strong>By Train:</strong> Nearest station - Vile Parle (Western Line)</li>
                    <li><strong>By Bus:</strong> Multiple BEST bus routes available</li>
                    <li><strong>By Taxi/Auto:</strong> Easily accessible from anywhere in Mumbai</li>
                    <li><strong>By Car:</strong> Limited parking available</li>
                    <li><strong>From Airport:</strong> 15 minutes from domestic terminal</li>
                  </ul>
                </div>
                
                <div className="bg-neutral p-6 rounded-xl shadow-md">
                  <div className="w-14 h-14 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                    <i className="ri-information-fill text-white text-2xl"></i>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-primary mb-2 text-center">Guidelines</h3>
                  <ul className="space-y-2 font-opensans">
                    <li>Modest dress is recommended for temple visits</li>
                    <li>Please remove shoes before entering the temple hall</li>
                    <li>Photography may be restricted in certain areas</li>
                    <li>Maintain silence in the temple hall</li>
                    <li>For group visits, please contact the temple office</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default Contact;
