import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2, Eye, EyeOff, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LiveVideo } from '@shared/schema';
import Layout from '@/components/admin/Layout';

const liveVideoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  youtubeUrl: z.string().url('Must be a valid YouTube URL'),
  isActive: z.boolean().default(true),
  order: z.number().min(1, 'Order must be at least 1'),
});

type LiveVideoForm = z.infer<typeof liveVideoSchema>;

const LiveVideos = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<LiveVideo | null>(null);
  const { toast } = useToast();

  const { data: liveVideos = [], isLoading } = useQuery<LiveVideo[]>({
    queryKey: ['/api/live-videos'],
  });

  const form = useForm<LiveVideoForm>({
    resolver: zodResolver(liveVideoSchema),
    defaultValues: {
      title: '',
      youtubeUrl: '',
      isActive: true,
      order: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LiveVideoForm) => {
      const response = await apiRequest('/api/live-videos', 'POST', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live-videos'] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Live video created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create live video',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LiveVideoForm> }) => {
      const response = await apiRequest(`/api/live-videos/${id}`, 'PUT', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live-videos'] });
      setEditingVideo(null);
      form.reset();
      toast({
        title: 'Success',
        description: 'Live video updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update live video',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/live-videos/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live-videos'] });
      toast({
        title: 'Success',
        description: 'Live video deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete live video',
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest(`/api/live-videos/${id}`, 'PUT', { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live-videos'] });
      toast({
        title: 'Success',
        description: 'Live video status updated',
      });
    },
  });

  const onSubmit = async (data: LiveVideoForm) => {
    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (video: LiveVideo) => {
    setEditingVideo(video);
    form.reset({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      isActive: video.isActive,
      order: video.order,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this live video?')) {
      deleteMutation.mutate(id);
    }
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.includes('watch?v=') 
      ? url.split('watch?v=')[1].split('&')[0]
      : url.split('youtu.be/')[1]?.split('?')[0];
    
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <Layout>
      <Helmet>
        <title>Live Videos Management - ISKCON Juhu Admin</title>
        <meta name="description" content="Manage live streaming videos for ISKCON Juhu temple" />
      </Helmet>

      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live Videos</h1>
            <p className="text-gray-600">Manage YouTube live streaming videos</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => form.reset()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Live Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingVideo ? 'Edit Live Video' : 'Add Live Video'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter video title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://www.youtube.com/watch?v=..."
                            type="url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="1"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setEditingVideo(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading live videos...</div>
        ) : (
          <div className="grid gap-4">
            {liveVideos.map((video) => (
              <Card key={video.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Tv className="w-5 h-5 text-red-500" />
                      <div>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription>
                          Order: {video.order} | Status: {video.isActive ? 'Active' : 'Inactive'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ 
                          id: video.id, 
                          isActive: !video.isActive 
                        })}
                      >
                        {video.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(video)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <img
                      src={getYouTubeThumbnail(video.youtubeUrl)}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/128/80';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 break-all">{video.youtubeUrl}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {liveVideos.length === 0 && (
              <div className="text-center py-8">
                <Tv className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No live videos found. Add your first live video!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={(open) => !open && setEditingVideo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Live Video</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter video title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://www.youtube.com/watch?v=..."
                        type="url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingVideo(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LiveVideos;