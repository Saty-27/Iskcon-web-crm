import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Gallery, insertGallerySchema } from '@shared/schema';
import { galleryApi } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/admin/Layout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  AlertCircle,
  MoveUp,
  MoveDown,
  Eye
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type GalleryFormValues = z.infer<typeof insertGallerySchema>;

const GalleryManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Gallery | null>(null);
  const [previewImage, setPreviewImage] = useState<Gallery | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Fetch gallery data
  const { data: galleryItems = [], isLoading } = useQuery<Gallery[]>({
    queryKey: ['/api/gallery'],
    queryFn: galleryApi.getAll,
  });
  
  // Sort gallery items by order
  const sortedGalleryItems = [...galleryItems].sort((a, b) => a.order - b.order);
  
  // Create form
  const createForm = useForm<GalleryFormValues>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: '',
      imageUrl: '',
      order: galleryItems.length > 0 ? Math.max(...galleryItems.map(item => item.order)) + 1 : 1,
    },
  });
  
  // Edit form
  const editForm = useForm<GalleryFormValues>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: '',
      imageUrl: '',
      order: 1,
    },
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: GalleryFormValues) => galleryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({
        title: "Image Added",
        description: "The gallery image has been added successfully.",
        variant: "success",
      });
      setIsCreateDialogOpen(false);
      createForm.reset({
        title: '',
        imageUrl: '',
        order: galleryItems.length + 1,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add gallery image. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GalleryFormValues }) => 
      galleryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({
        title: "Image Updated",
        description: "The gallery image has been updated successfully.",
        variant: "success",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update gallery image. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => galleryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({
        title: "Image Deleted",
        description: "The gallery image has been deleted successfully.",
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
      setSelectedImage(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete gallery image. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GalleryFormValues> }) => 
      galleryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reorder gallery. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handlers
  const onCreateSubmit = (data: GalleryFormValues) => {
    createMutation.mutate(data);
  };
  
  const onEditSubmit = (data: GalleryFormValues) => {
    if (selectedImage) {
      updateMutation.mutate({ id: selectedImage.id, data });
    }
  };
  
  const handleMoveUp = (image: Gallery) => {
    const currentIndex = sortedGalleryItems.findIndex(item => item.id === image.id);
    if (currentIndex <= 0) return;
    
    const prevImage = sortedGalleryItems[currentIndex - 1];
    
    // Swap orders
    reorderMutation.mutate({ 
      id: image.id, 
      data: { order: prevImage.order } 
    });
    
    reorderMutation.mutate({ 
      id: prevImage.id, 
      data: { order: image.order } 
    });
  };
  
  const handleMoveDown = (image: Gallery) => {
    const currentIndex = sortedGalleryItems.findIndex(item => item.id === image.id);
    if (currentIndex >= sortedGalleryItems.length - 1) return;
    
    const nextImage = sortedGalleryItems[currentIndex + 1];
    
    // Swap orders
    reorderMutation.mutate({ 
      id: image.id, 
      data: { order: nextImage.order } 
    });
    
    reorderMutation.mutate({ 
      id: nextImage.id, 
      data: { order: image.order } 
    });
  };
  
  const handleEdit = (image: Gallery) => {
    setSelectedImage(image);
    editForm.reset({
      title: image.title,
      imageUrl: image.imageUrl,
      order: image.order,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (image: Gallery) => {
    setSelectedImage(image);
    setIsDeleteDialogOpen(true);
  };
  
  const handlePreview = (image: Gallery) => {
    setPreviewImage(image);
    setIsPreviewOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedImage) {
      deleteMutation.mutate(selectedImage.id);
    }
  };
  
  return (
    <Layout>
      <Helmet>
        <title>Gallery Management - ISKCON Juhu Admin</title>
      </Helmet>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Gallery Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage images in the gallery. {galleryItems.length} of 20 images used.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
            disabled={galleryItems.length >= 20}
          >
            <PlusCircle className="h-5 w-5" />
            Add Image
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="rounded-md border bg-background p-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Gallery Images Found</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              You haven't added any gallery images yet. Add images to showcase on the website.
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              Add Your First Image
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedGalleryItems.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full"
                        onClick={() => handlePreview(image)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full"
                        onClick={() => handleEdit(image)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full"
                        onClick={() => handleDelete(image)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="truncate mr-2">
                      <p className="font-medium truncate">{image.title}</p>
                      <p className="text-xs text-muted-foreground">Order: {image.order}</p>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveUp(image)}
                        disabled={image.order === Math.min(...galleryItems.map(i => i.order))}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMoveDown(image)}
                        disabled={image.order === Math.max(...galleryItems.map(i => i.order))}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Create Image Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
            <DialogDescription>
              Add a new image to the gallery. All fields are required.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Image"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Image Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Gallery Image</DialogTitle>
            <DialogDescription>
              Update the gallery image information. All fields are required.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Image"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Preview Image Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] p-1 overflow-hidden">
          {previewImage && (
            <div className="relative">
              <img 
                src={previewImage.imageUrl} 
                alt={previewImage.title}
                className="w-full object-contain max-h-[80vh]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                <h3 className="text-white font-medium">{previewImage.title}</h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image
              <strong> {selectedImage?.title}</strong> from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default GalleryManagement;
