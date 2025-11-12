import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import logoIskcon from '@/assets/logo-iskcon.png';
import { LiveVideo } from '@shared/schema';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLiveVideoOpen, setIsLiveVideoOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const isHomePage = location === '/';
  
  // Fetch live videos
  const { data: liveVideos = [] } = useQuery<LiveVideo[]>({
    queryKey: ['/api/live-videos'],
  });

  // Get the first active live video, or first video if none active
  const currentLiveVideo = liveVideos.find(video => video.isActive) || liveVideos[0];
  
  // Function to convert YouTube URL to embed format
  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    
    if (url.includes('watch?v=')) {
      // Regular YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      // Short YouTube URL: https://youtu.be/VIDEO_ID
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('/live/')) {
      // YouTube Live URL: https://www.youtube.com/live/VIDEO_ID
      videoId = url.split('/live/')[1].split('?')[0];
    } else {
      // Try to extract video ID from any YouTube URL
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      videoId = match ? match[1] : '';
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled || !isHomePage ? 'bg-white bg-opacity-95 shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src={logoIskcon} 
              alt="ISKCON Juhu" 
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-poppins font-medium text-primary hover:text-secondary transition-colors">
              Home
            </Link>
            <Link href="/donate" className="font-poppins font-medium text-dark hover:text-secondary transition-colors">
              Donate
            </Link>
            <Link href="/events" className="font-poppins font-medium text-dark hover:text-secondary transition-colors">
              Events
            </Link>
            <Link href="/gallery" className="font-poppins font-medium text-dark hover:text-secondary transition-colors">
              Gallery
            </Link>
            <Link href="/videos" className="font-poppins font-medium text-dark hover:text-secondary transition-colors">
              Videos
            </Link>
            <Link href="/blog" className="font-poppins font-medium text-dark hover:text-secondary transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="font-poppins font-medium text-dark hover:text-secondary transition-colors">
              Contact
            </Link>
            <button
              onClick={() => setIsLiveVideoOpen(true)}
              className="font-poppins font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-colors flex items-center gap-2 animate-pulse"
              disabled={!currentLiveVideo}
            >
              <Play className="w-4 h-4" />
              Watch Live
            </button>
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <span className="font-poppins text-dark font-medium">{user.name}</span>
                <Link 
                  href="/profile" 
                  className="font-poppins text-white bg-primary hover:bg-opacity-90 px-5 py-2 rounded-full transition-colors"
                >
                  My Profile
                </Link>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="font-poppins text-white bg-primary hover:bg-opacity-90 px-5 py-2 rounded-full transition-colors"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-primary text-2xl focus:outline-none"
          >
            <i className="ri-menu-line"></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden bg-white border-t ${mobileMenuOpen ? 'block' : 'hidden'}`}
      >
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-col space-y-4 py-2">
            <Link 
              href="/"
              className="font-poppins font-medium text-primary hover:text-secondary transition-colors"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              href="/donate"
              className="font-poppins font-medium text-dark hover:text-secondary transition-colors"
              onClick={closeMobileMenu}
            >
              Donate
            </Link>
            <Link 
              href="/events"
              className="font-poppins font-medium text-dark hover:text-secondary transition-colors"
              onClick={closeMobileMenu}
            >
              Events
            </Link>
            <Link 
              href="/gallery"
              className="font-poppins font-medium text-dark hover:text-secondary transition-colors"
              onClick={closeMobileMenu}
            >
              Gallery
            </Link>
            <Link 
              href="/videos"
              className="font-poppins font-medium text-dark hover:text-secondary transition-colors"
              onClick={closeMobileMenu}
            >
              Videos
            </Link>
            <Link 
              href="/blog"
              className="font-poppins font-medium text-dark hover:text-secondary transition-colors"
              onClick={closeMobileMenu}
            >
              Blog
            </Link>
            <Link 
              href="/contact"
              className="font-poppins font-medium text-dark hover:text-secondary transition-colors"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
            <button
              onClick={() => {
                setIsLiveVideoOpen(true);
                closeMobileMenu();
              }}
              className="font-poppins font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full transition-colors flex items-center gap-2 animate-pulse justify-center"
              disabled={!currentLiveVideo}
            >
              <Play className="w-4 h-4" />
              Watch Live
            </button>
            {isAuthenticated && user ? (
              <div className="flex flex-col space-y-2">
                <span className="font-poppins text-dark font-medium">Welcome, {user.name}</span>
                <Link 
                  href="/profile"
                  className="font-poppins text-white bg-primary hover:bg-opacity-90 px-5 py-2 rounded-full text-center transition-colors"
                  onClick={closeMobileMenu}
                >
                  My Profile
                </Link>
              </div>
            ) : (
              <Link 
                href="/login"
                className="font-poppins text-white bg-primary hover:bg-opacity-90 px-5 py-2 rounded-full text-center transition-colors"
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Live Video Modal */}
      {currentLiveVideo && (
        <Dialog open={isLiveVideoOpen} onOpenChange={setIsLiveVideoOpen}>
          <DialogContent className="max-w-4xl w-full p-0 bg-black">
            <DialogHeader className="p-4 bg-black text-white">
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-500" />
                {currentLiveVideo.title}
              </DialogTitle>
            </DialogHeader>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={getYouTubeEmbedUrl(currentLiveVideo.youtubeUrl)}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentLiveVideo.title}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

    </header>
  );
};

export default Header;
