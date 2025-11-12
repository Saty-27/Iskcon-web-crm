import { useState } from 'react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { SocialLink } from '@shared/schema';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({
    queryKey: ['/api/social-links'],
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest('/api/subscribe', 'POST', { email });
      toast({
        title: "Subscription Successful",
        description: "Thank you for subscribing to our newsletter!",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="relative pt-16 pb-8 text-white" style={{ backgroundColor: 'rgb(255, 45, 85)' }}>
      {/* Decorative dots - top left */}
      <div className="absolute top-8 left-8 text-white opacity-60">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
          ))}
        </div>
      </div>
      
      {/* Decorative dots - top right */}
      <div className="absolute top-8 right-8 text-white opacity-60">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Decorative dots - bottom left */}
      <div className="absolute bottom-8 left-8 text-white opacity-60">
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Decorative dots - bottom right */}
      <div className="absolute bottom-8 right-8 text-white opacity-60">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-poppins font-bold text-2xl mb-4">
              ISKCON <span className="text-yellow-300">Juhu</span>
            </h3>
            <p className="font-opensans mb-6">
              The International Society for Krishna Consciousness, founded by His Divine Grace 
              A.C. Bhaktivedanta Swami Prabhupada in 1966.
            </p>
            <div className="flex space-x-4">
              {socialLinks.filter(link => link.isActive).map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors"
                  style={{ backgroundColor: '#4B0082', color: 'white' }}
                >
                  {link.icon && link.icon.startsWith('/uploads/') ? (
                    <img 
                      src={link.icon} 
                      alt={`${link.platform} icon`} 
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <i className={`${link.icon || 'ri-link'} text-lg`}></i>
                  )}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-xl mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="font-opensans hover:text-yellow-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/donate" className="font-opensans hover:text-yellow-300 transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/events" className="font-opensans hover:text-yellow-300 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="font-opensans hover:text-yellow-300 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/videos" className="font-opensans hover:text-yellow-300 transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-opensans hover:text-yellow-300 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-xl mb-4">Programs</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-opensans hover:text-yellow-300 transition-colors">Morning Aarti</a>
              </li>
              <li>
                <a href="#" className="font-opensans hover:text-yellow-300 transition-colors">Bhagavad Gita Classes</a>
              </li>
              <li>
                <a href="#" className="font-opensans hover:text-yellow-300 transition-colors">Sunday Feast</a>
              </li>
              <li>
                <a href="#" className="font-opensans hover:text-yellow-300 transition-colors">Kirtan Events</a>
              </li>
              <li>
                <a href="#" className="font-opensans hover:text-yellow-300 transition-colors">Youth Programs</a>
              </li>
              <li>
                <a href="#" className="font-opensans hover:text-yellow-300 transition-colors">Food for Life</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-xl mb-4">Newsletter</h4>
            <p className="font-opensans mb-4">
              Subscribe to receive updates on events, festivals, and spiritual insights.
            </p>
            <form className="space-y-3" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 
                focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent 
                text-white placeholder-white placeholder-opacity-60" 
                required 
              />
              <button 
                type="submit" 
                className="w-full text-white font-poppins font-medium py-2 rounded-lg 
                hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: '#4B0082' }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-20 pt-8 text-center">
          <p className="font-opensans text-sm">&copy; {new Date().getFullYear()} ISKCON Juhu. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
