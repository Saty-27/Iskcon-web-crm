import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Banner } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import iskconDeitiesImg from "@assets/Website FFC_20250531_190536_0000_1749327853462.png";

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: banners = [], isLoading, error } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
  });

  // Debug logging
  console.log('Banners:', banners, 'Length:', banners.length, 'Loading:', isLoading, 'Error:', error);
  console.log('Current slide:', currentSlide);
  
  // Auto-advance slides
  useEffect(() => {
    if (banners.length <= 1) return; // Only auto-advance if there are multiple banners
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);
  
  // Reset current slide when banners change
  useEffect(() => {
    setCurrentSlide(0);
  }, [banners]);
  
  if (isLoading) {
    return (
      <section className="relative overflow-hidden h-screen">
        <Skeleton className="w-full h-full" />
      </section>
    );
  }
  
  // Show fallback only if no banners exist and not loading
  if (banners.length === 0 && !isLoading) {
    return (
      <section className="relative overflow-hidden h-screen">
        <div className="h-full w-full absolute inset-0">
          <img 
            src={iskconDeitiesImg} 
            alt="Sri Sri Radha Rasabihari" 
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-black bg-opacity-40 rounded-2xl p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
              <h2 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 lg:mb-8 leading-tight drop-shadow-lg">
                Welcome to ISKCON Juhu
              </h2>
              <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
                Experience divine bliss at the spiritual heart of Mumbai
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/donate" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 sm:px-8 sm:py-3 lg:px-10 lg:py-4 rounded-full 
                    inline-block transition-all transform hover:-translate-y-1 text-sm sm:text-base lg:text-lg shadow-lg">
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative overflow-hidden h-screen bg-gray-900">
      {banners.length > 0 && (
        <div className="h-full w-full">
          <img 
            src={banners[0].imageUrl} 
            alt={banners[0].title} 
            className="object-cover w-full h-full"
            onError={(e) => {
              console.error('Image failed to load:', banners[0].imageUrl);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', banners[0].imageUrl);
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end justify-center pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12">
                <h2 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 lg:mb-8 leading-tight drop-shadow-lg">
                  {banners[0].title}
                </h2>
                {banners[0].description && (
                  <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
                    {banners[0].description}
                  </p>
                )}
                <div className="flex justify-center gap-4">
                  {banners[0].buttonText && banners[0].buttonLink ? (
                    <Link href={banners[0].buttonLink} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 sm:px-8 sm:py-3 lg:px-10 lg:py-4 rounded-full 
                        inline-block transition-all transform hover:-translate-y-1 text-sm sm:text-base lg:text-lg shadow-lg">
                      {banners[0].buttonText}
                    </Link>
                  ) : (
                    <Link href="/donate" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 sm:px-8 sm:py-3 lg:px-10 lg:py-4 rounded-full 
                        inline-block transition-all transform hover:-translate-y-1 text-sm sm:text-base lg:text-lg shadow-lg">
                      Donate Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slider Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-0 right-0 z-30 flex justify-center space-x-2 sm:space-x-3">
          {banners.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-orange-500' 
                  : 'bg-white bg-opacity-60 hover:bg-opacity-80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;