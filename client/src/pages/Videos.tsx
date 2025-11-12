import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Video } from '@shared/schema';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

const Videos = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });
  
  const openVideoPlayer = (video: Video) => {
    setSelectedVideo(video);
  };
  
  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };
  
  return (
    <>
      <Helmet>
        <title>Videos - ISKCON Juhu</title>
        <meta name="description" content="Watch spiritual discourses, temple ceremonies, kirtans, and other divine events from ISKCON Juhu Temple." />
        <meta property="og:title" content="Videos - ISKCON Juhu" />
        <meta property="og:description" content="Watch spiritual discourses, temple ceremonies, kirtans, and other divine events from ISKCON Juhu Temple." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-primary">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl mb-4">
              Video Gallery
            </h1>
            <p className="text-white font-opensans text-lg md:text-xl max-w-3xl mx-auto">
              Watch divine ceremonies, spiritual discourses, bhajans and more
            </p>
          </div>
        </section>
        
        {/* Videos Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden shadow-md">
                    <Skeleton className="w-full aspect-video" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="font-poppins font-semibold text-xl text-gray-500 mb-2">No Videos Available</h3>
                <p className="font-opensans text-gray-500">
                  Please check back later for video updates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div 
                    key={video.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md"
                  >
                    <div 
                      className="relative aspect-video cursor-pointer"
                      onClick={() => openVideoPlayer(video)}
                    >
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                          <i className="ri-play-fill text-3xl text-primary"></i>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-poppins font-semibold text-lg text-primary">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && closeVideoPlayer()}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {selectedVideo ? selectedVideo.title : "Video Player"}
            </DialogTitle>
          </DialogHeader>
          <div className="relative">
            {selectedVideo && (
              <div className="aspect-video w-full">
                <iframe 
                  src={selectedVideo.youtubeUrl.replace('watch?v=', 'embed/')} 
                  title={selectedVideo.title}
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            <button 
              onClick={closeVideoPlayer}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-1 focus:outline-none"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Videos;
