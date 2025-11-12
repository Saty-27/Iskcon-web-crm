import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Gallery, Video } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import ReactPlayer from 'react-player';

const MediaHighlights = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const { data: galleryItems = [], isLoading: isLoadingGallery } = useQuery<Gallery[]>({
    queryKey: ['/api/gallery'],
  });
  
  const { data: videos = [], isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });
  
  const isLoading = isLoadingGallery || isLoadingVideos;
  
  const playVideo = (video: Video) => {
    setSelectedVideo(video);
  };
  
  if (isLoading) {
    return (
      <section className="py-16 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-24 md:h-32 rounded-lg" />
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              
              <div className="space-y-4">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <Skeleton className="w-full aspect-video rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 bg-neutral">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
            Media Highlights
          </h2>
          <p className="font-opensans text-lg max-w-2xl mx-auto text-dark">
            Glimpses of our temple, festivals, and spiritual activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery Preview */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-poppins font-semibold text-xl text-primary">Photo Gallery</h3>
              <Link href="/gallery" className="text-secondary hover:text-primary font-medium transition-colors flex items-center">
                View All <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryItems.length === 0 ? (
                <div className="col-span-2 md:col-span-3 text-center py-8 text-gray-500">
                  <p>No gallery images available</p>
                </div>
              ) : (
                galleryItems.slice(0, 6).map((item) => (
                  <Link key={item.id} href="/gallery" className="overflow-hidden rounded-lg h-24 md:h-32 block relative group bg-white border">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="eager"
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log('Image loaded successfully:', item.imageUrl);
                        target.style.display = 'block';
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Image failed to load:', item.imageUrl);
                        target.style.display = 'none';
                        if (!target.parentElement?.querySelector('.fallback-text')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-text w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-50';
                          fallback.textContent = item.title;
                          target.parentElement?.appendChild(fallback);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">View</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-poppins font-semibold text-xl text-primary">Video Gallery</h3>
              <Link href="/videos" className="text-secondary hover:text-primary font-medium transition-colors flex items-center">
                View All <i className="ri-arrow-right-line ml-1"></i>
              </Link>
            </div>
            
            <div className="space-y-4">
              {videos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No videos available</p>
                </div>
              ) : (
                videos.slice(0, 2).map((video) => (
                  <div key={video.id} className="rounded-lg overflow-hidden relative aspect-video bg-white border">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                      loading="eager"
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log('Video thumbnail loaded successfully:', video.thumbnailUrl);
                        target.style.display = 'block';
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Video thumbnail failed to load:', video.thumbnailUrl);
                        target.style.display = 'none';
                        if (!target.parentElement?.querySelector('.fallback-text')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-text w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50';
                          fallback.textContent = video.title;
                          target.parentElement?.appendChild(fallback);
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={() => playVideo(video)} 
                        className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                      >
                        <i className="ri-play-fill text-3xl text-primary"></i>
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h4 className="text-white font-poppins font-medium">{video.title}</h4>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black">
          <DialogHeader className="p-4 absolute top-0 right-0 z-10">
            <DialogTitle className="sr-only">
              {selectedVideo ? selectedVideo.title : "Video Player"}
            </DialogTitle>
            <DialogClose className="text-white hover:text-gray-300">
              <X size={24} />
            </DialogClose>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video w-full">
              <ReactPlayer 
                url={selectedVideo.youtubeUrl} 
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  youtube: {
                    playerVars: {
                      showinfo: 1,
                      modestbranding: 1
                    }
                  }
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MediaHighlights;
