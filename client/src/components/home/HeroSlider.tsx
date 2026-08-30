import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Banner } from '@shared/schema';
import iskconDeitiesImg from "@assets/gradientbg_1752332694284.png";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { data: rawBanners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: () => {
      try {
        const cached = localStorage.getItem('iskcon_cached_banners');
        return cached ? JSON.parse(cached) : undefined;
      } catch (_) {
        return undefined;
      }
    },
  });

  // Keep local storage updated with latest banners
  useEffect(() => {
    if (rawBanners && rawBanners.length > 0) {
      try {
        localStorage.setItem('iskcon_cached_banners', JSON.stringify(rawBanners));
      } catch (_) {}
    }
  }, [rawBanners]);

  // Filter banners based on user device (Desktop 1920x1080 vs Mobile 1080x1920)
  const banners = useMemo(() => {
    if (isMobile) {
      const mobileOnly = rawBanners.filter((b) => b.screenType === 'mobile');
      if (mobileOnly.length > 0) return mobileOnly;
      return rawBanners.filter((b) => b.screenType === 'desktop' || !b.screenType);
    } else {
      const desktopOnly = rawBanners.filter((b) => b.screenType === 'desktop' || !b.screenType);
      if (desktopOnly.length > 0) return desktopOnly;
      return rawBanners;
    }
  }, [rawBanners, isMobile]);
  
  // Auto-advance slides if multiple banners exist
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);
  
  // Reset current slide when banners change
  useEffect(() => {
    setCurrentSlide(0);
  }, [banners]);

  const activeBanner = banners.length > 0 ? (banners[currentSlide] || banners[0]) : null;
  const nextSlideIndex = banners.length > 1 ? (currentSlide + 1) % banners.length : null;

  const hasTitle = Boolean(activeBanner?.title?.trim());
  const hasDescription = Boolean(activeBanner?.description?.trim());
  const hasButton = Boolean(activeBanner?.buttonText?.trim() && activeBanner?.buttonLink?.trim());
  const hasAnyOverlay = hasTitle || hasDescription || hasButton;
  const bannerRedirectUrl = activeBanner?.buttonLink || '/donate';

  return (
    <section className="relative overflow-hidden min-h-[520px] h-[85vh] sm:h-screen bg-gray-900">
      {/* Preload the next carousel slide so transition is seamless */}
      {nextSlideIndex !== null && banners[nextSlideIndex]?.imageUrl && (
        <link rel="prefetch" as="image" href={banners[nextSlideIndex].imageUrl} />
      )}

      {activeBanner ? (
        <div className="h-full w-full relative transition-all duration-700 ease-in-out">
          {/* Clicking anywhere on the banner background redirects to target action */}
          <Link href={bannerRedirectUrl} className="block w-full h-full cursor-pointer select-none">
            <img 
              src={activeBanner.imageUrl} 
              alt={activeBanner.title || "ISKCON Juhu Banner"} 
              loading="eager"
              // @ts-ignore
              fetchPriority="high"
              decoding="async"
              className="object-cover w-full h-full"
              width={activeBanner.screenType === 'mobile' ? "1080" : "1920"}
              height={activeBanner.screenType === 'mobile' ? "1920" : "1080"}
            />
          </Link>

          {/* Render overlay ONLY if title, description, or button is provided */}
          {hasAnyOverlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent flex items-end justify-center pb-12 sm:pb-16 md:pb-20 pointer-events-none">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">
                <div className="max-w-4xl mx-auto">
                  {hasTitle && (
                    <h1 className="text-white font-bold text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-2 sm:mb-4 lg:mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-poppins">
                      {activeBanner.title}
                    </h1>
                  )}
                  {hasDescription && (
                    <p className="text-gray-100 text-xs sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] font-opensans">
                      {activeBanner.description}
                    </p>
                  )}
                  {hasButton && (
                    <div className="flex justify-center gap-3">
                      <Link 
                        href={activeBanner.buttonLink!} 
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full 
                          inline-block transition-all transform hover:-translate-y-0.5 text-xs sm:text-base shadow-xl pointer-events-auto"
                      >
                        {activeBanner.buttonText}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isLoading ? (
        /* Loading skeleton: sleek dark container to prevent layout shift and avoid flashing old fallback image */
        <div className="h-full w-full bg-gray-900 animate-pulse flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Fallback Default Hero (only shown if no banners exist in DB after fetch) */
        <div className="h-full w-full relative">
          <Link href="/donate" className="block w-full h-full cursor-pointer select-none">
            <img 
              src={iskconDeitiesImg} 
              alt="Sri Sri Radha Rasabihari" 
              loading="eager"
              // @ts-ignore
              fetchPriority="high"
              decoding="async"
              className="object-cover w-full h-full"
              width="1920"
              height="1080"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent flex items-end justify-center pb-12 sm:pb-16 md:pb-20 pointer-events-none">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-white font-bold text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-2 sm:mb-4 lg:mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-poppins">
                  Welcome to ISKCON Juhu
                </h1>
                <p className="text-gray-100 text-xs sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] font-opensans">
                  Experience divine bliss at the spiritual heart of Mumbai
                </p>
                <div className="flex justify-center gap-3">
                  <Link href="/donate" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full 
                      inline-block transition-all transform hover:-translate-y-0.5 text-xs sm:text-base shadow-xl pointer-events-auto">
                    Donate Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slider Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-0 right-0 z-30 flex justify-center space-x-2 sm:space-x-3">
          {banners.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-orange-500 scale-125' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;