import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Menu, X } from 'lucide-react';
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
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsLiveVideoOpen(true)}
              className="text-xs font-poppins font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 animate-pulse"
              disabled={!currentLiveVideo}
              title="Watch Live"
            >
              <Play className="w-3 h-3 fill-current" />
              Live
            </button>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bottom-0 bg-black/40 z-40 backdrop-blur-xs" onClick={closeMobileMenu}>
          <div 
            className="bg-white border-t border-gray-100 shadow-xl max-h-[calc(100vh-60px)] overflow-y-auto px-5 py-5 space-y-4 animate-in slide-in-from-top duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-3 font-poppins font-medium text-base">
              <Link 
                href="/"
                className="text-primary hover:text-secondary py-2 border-b border-gray-100 flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span>Home</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link 
                href="/donate"
                className="text-dark hover:text-secondary py-2 border-b border-gray-100 flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span className="text-primary font-semibold">Donate (Seva)</span>
                <span className="text-xs text-primary font-bold">♥</span>
              </Link>
              <Link 
                href="/events"
                className="text-dark hover:text-secondary py-2 border-b border-gray-100 flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span>Events & Festivals</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link 
                href="/gallery"
                className="text-dark hover:text-secondary py-2 border-b border-gray-100 flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span>Gallery & Darshan</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link 
                href="/videos"
                className="text-dark hover:text-secondary py-2 border-b border-gray-100 flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span>Videos & Lectures</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link 
                href="/blog"
                className="text-dark hover:text-secondary py-2 border-b border-gray-100 flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span>Articles & Blog</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
              <Link 
                href="/contact"
                className="text-dark hover:text-secondary py-2 border-b border-gray-100 flex items-center justify-between"
                onClick={closeMobileMenu}
              >
                <span>Contact & Timings</span>
                <span className="text-xs text-gray-400">→</span>
              </Link>
            </nav>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              {isAuthenticated && user ? (
                <div className="flex flex-col space-y-2">
                  <div className="text-xs text-gray-500 font-medium">Logged in as {user.name}</div>
                  <Link 
                    href="/profile"
                    className="w-full font-poppins text-white bg-primary hover:bg-opacity-90 py-3 rounded-xl text-center font-semibold shadow-md transition-all"
                    onClick={closeMobileMenu}
                  >
                    My Profile & History
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href="/login"
                    className="font-poppins text-center text-primary bg-primary/10 hover:bg-primary/20 py-2.5 rounded-xl font-medium transition-all"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/donate"
                    className="font-poppins text-center text-white bg-primary hover:bg-primary/90 py-2.5 rounded-xl font-medium shadow-md transition-all"
                    onClick={closeMobileMenu}
                  >
                    Donate
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
