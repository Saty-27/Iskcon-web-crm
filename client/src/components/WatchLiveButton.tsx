import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Tv } from 'lucide-react';
import { LiveVideo } from '@shared/schema';

const WatchLiveButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch live videos
  const { data: liveVideos = [], isLoading } = useQuery<LiveVideo[]>({
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

  if (isLoading || !currentLiveVideo) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg z-50 animate-pulse"
        size="lg"
      >
        <Tv className="w-6 h-6 mr-2" />
        Watch Live
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
    </>
  );
};

export default WatchLiveButton;