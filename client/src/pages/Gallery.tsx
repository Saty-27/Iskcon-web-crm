import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gallery as GalleryItem } from '@shared/schema';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const Gallery = () => {
  const [currentImage, setCurrentImage] = useState<GalleryItem | null>(null);
  
  const { data: galleryItems = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ['/api/gallery'],
  });
  
  const openImageViewer = (image: GalleryItem) => {
    setCurrentImage(image);
  };
  
  const closeImageViewer = () => {
    setCurrentImage(null);
  };
  
  const navigateImage = (direction: 'prev' | 'next') => {
    if (!currentImage || galleryItems.length === 0) return;
    
    const currentIndex = galleryItems.findIndex(item => item.id === currentImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : galleryItems.length - 1;
    } else {
      newIndex = currentIndex < galleryItems.length - 1 ? currentIndex + 1 : 0;
    }
    
    setCurrentImage(galleryItems[newIndex]);
  };
  
  return (
    <>
      <Helmet>
        <title>Gallery - ISKCON Juhu</title>
        <meta name="description" content="Browse through a beautiful collection of images from ISKCON Juhu temple, festivals, events, and spiritual activities." />
        <meta property="og:title" content="Gallery - ISKCON Juhu" />
        <meta property="og:description" content="Browse through a beautiful collection of images from ISKCON Juhu temple, festivals, events, and spiritual activities." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-primary">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl mb-4">
              Photo Gallery
            </h1>
            <p className="text-white font-opensans text-lg md:text-xl max-w-3xl mx-auto">
              Glimpses of divine moments, festivals, and temple activities
            </p>
          </div>
        </section>
        
        {/* Gallery Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="w-full aspect-square rounded-lg" />
                ))}
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="font-poppins font-semibold text-xl text-gray-500 mb-2">No Images Available</h3>
                <p className="font-opensans text-gray-500">
                  Please check back later for gallery updates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {galleryItems.map((item) => (
                  <div 
                    key={item.id}
                    className="overflow-hidden rounded-lg aspect-square cursor-pointer relative group"
                    onClick={() => openImageViewer(item)}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-poppins font-medium">View</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Image Viewer Dialog */}
      <Dialog open={!!currentImage} onOpenChange={(open) => !open && closeImageViewer()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black" hideClose>
          <div className="relative">
            {currentImage && (
              <img 
                src={currentImage.imageUrl} 
                alt={currentImage.title}
                className="w-full object-contain max-h-[80vh]"
              />
            )}
            
            <button 
              onClick={closeImageViewer}
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            
            <button 
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
            
            {currentImage && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                <h3 className="text-white font-poppins font-medium">{currentImage.title}</h3>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;
