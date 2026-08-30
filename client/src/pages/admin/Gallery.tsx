import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/admin/Layout";
import { Gallery, insertGallerySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Eye, 
  Search, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Copy
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const GalleryPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [previewingGallery, setPreviewingGallery] = useState<Gallery | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: galleryItems = [], isLoading, refetch, isRefetching } = useQuery<Gallery[]>({
    queryKey: ['/api/gallery'],
  });

  const createForm = useForm({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      order: 0,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      order: 0,
    },
  });

  const createImageUrl = createForm.watch("imageUrl");
  const editImageUrl = editForm.watch("imageUrl");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/gallery', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setIsCreateOpen(false);
      createForm.reset();
      toast({ title: "Success", description: "Gallery photo added successfully" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Error", 
        description: err?.message || "Failed to create gallery item", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/gallery/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      setEditingGallery(null);
      editForm.reset();
      toast({ title: "Success", description: "Gallery photo updated successfully" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Error", 
        description: err?.message || "Failed to update gallery item", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/gallery/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery'] });
      toast({ title: "Success", description: "Gallery photo deleted successfully" });
    },
    onError: (err: any) => {
      toast({ 
        title: "Error", 
        description: err?.message || "Failed to delete gallery item", 
        variant: "destructive" 
      });
    },
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEdit = (item: Gallery) => {
    setEditingGallery(item);
    editForm.reset({
      title: item.title,
      imageUrl: item.imageUrl,
      order: item.order,
    });
  };

  const handleUpdate = (data: any) => {
    if (editingGallery) {
      updateMutation.mutate({ id: editingGallery.id, data });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this gallery photo?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = async (file: File, form: any) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('file', file);
      formData.append('type', 'gallery');
      
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/upload/gallery', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Upload failed. Please ensure file is an image under 25MB.');
      }
      
      const data = await response.json();
      const uploadedUrl = data.imageUrl || data.url;
      form.setValue('imageUrl', uploadedUrl);
      
      toast({
        title: "Upload Complete",
        description: "Image uploaded and preview ready.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast({
      title: "Copied",
      description: "Direct image URL copied to clipboard.",
    });
  };

  const filteredItems = galleryItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.imageUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Temple Gallery Photos</h1>
            </div>
            <p className="text-sm text-slate-400">
              Manage devotee darshan photos, festival celebrations, and temple gallery albums with real-time previews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Upload Gallery Photo
                  </DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4 pt-2">
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-300">Photo Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Sri Sri Radha Rasabihari Maha Aarti" 
                              {...field} 
                              className="bg-slate-950 border-slate-800 text-sm"
                            />
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
                          <FormLabel className="text-xs font-semibold text-slate-300">Image Source & Live Preview</FormLabel>
                          <FormControl>
                            <Tabs defaultValue="upload" className="w-full">
                              <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800 mb-3">
                                <TabsTrigger value="upload" className="flex items-center gap-2 text-xs">
                                  <Upload className="w-3.5 h-3.5" />
                                  Upload File
                                </TabsTrigger>
                                <TabsTrigger value="url" className="flex items-center gap-2 text-xs">
                                  <LinkIcon className="w-3.5 h-3.5" />
                                  Direct URL
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="upload" className="space-y-3">
                                <div className="border-2 border-dashed border-slate-800 hover:border-orange-500/50 rounded-xl p-4 text-center bg-slate-950/60 transition-colors">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(file, createForm);
                                      }
                                    }}
                                    disabled={uploadingFile}
                                    className="cursor-pointer text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30"
                                  />
                                  {uploadingFile && (
                                    <p className="text-xs text-orange-400 mt-2 animate-pulse">Uploading file to server...</p>
                                  )}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="url">
                                <Input 
                                  placeholder="https://... or /uploads/gallery/..." 
                                  {...field} 
                                  className="bg-slate-950 border-slate-800 text-sm"
                                />
                              </TabsContent>
                            </Tabs>
                          </FormControl>
                          <FormMessage />

                          {/* Live Preview Box */}
                          {createImageUrl && (
                            <div className="mt-3 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                              <p className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-orange-400" />
                                Live Image Preview:
                              </p>
                              <div className="h-44 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                                <img 
                                  src={createImageUrl} 
                                  alt="Preview" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-300">Display Order</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              className="bg-slate-950 border-slate-800 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="border-t border-slate-800 pt-3">
                      <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-slate-700 text-slate-300">
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || uploadingFile || !createImageUrl}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      >
                        {createMutation.isPending ? "Creating..." : "Save Gallery Photo"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search photos by title or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 text-sm"
            />
          </div>

          <div className="text-xs text-slate-400">
            Total Photos: <span className="font-semibold text-white">{filteredItems.length}</span>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                  <Skeleton className="h-48 w-full rounded-lg bg-slate-800" />
                  <Skeleton className="h-4 w-3/4 bg-slate-800" />
                  <Skeleton className="h-3 w-1/2 bg-slate-800" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-700" />
              <h3 className="text-base font-semibold text-slate-300">No gallery photos found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload photos to display in the temple darshan gallery on the public website.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="group bg-slate-950 border border-slate-800 hover:border-orange-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="h-52 relative overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setPreviewingGallery(item)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-badge')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'fallback-badge flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2';
                          fallback.innerHTML = `
                            <svg class="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span class="text-xs font-medium text-slate-500">Image file not on server</span>
                          `;
                          parent.appendChild(fallback);
                        }
                      }}
                    />

                    {/* Order Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800 text-[11px] font-mono font-semibold text-orange-400 shadow">
                      #{item.order}
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewingGallery(item)}
                        className="bg-white/90 hover:bg-white text-slate-950 font-semibold text-xs shadow-lg"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyUrlToClipboard(item.imageUrl)}
                        className="bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-xs shadow-lg"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Link
                      </Button>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-slate-950">
                    <div>
                      <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5" title={item.imageUrl}>
                        {item.imageUrl}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 h-8 px-2.5"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High-Resolution Zoom Lightbox Preview Modal */}
        <Dialog open={!!previewingGallery} onOpenChange={() => setPreviewingGallery(null)}>
          <DialogContent className="bg-slate-950 border border-slate-800 text-slate-100 max-w-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center justify-between">
                <span>{previewingGallery?.title}</span>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                  Order #{previewingGallery?.order}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            {previewingGallery && (
              <div className="space-y-4 pt-2">
                <div className="max-h-[60vh] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <img 
                    src={previewingGallery.imageUrl} 
                    alt={previewingGallery.title} 
                    className="max-h-[60vh] w-auto max-w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="font-mono truncate max-w-md">{previewingGallery.imageUrl}</div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyUrlToClipboard(previewingGallery.imageUrl)}
                      className="border-slate-700 text-xs h-8"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Copy URL
                    </Button>
                    <a href={previewingGallery.imageUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Open Original
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingGallery} onOpenChange={() => setEditingGallery(null)}>
          <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-orange-500" />
                Edit Gallery Photo
              </DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4 pt-2">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-300">Photo Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Gallery photo title" {...field} className="bg-slate-950 border-slate-800 text-sm" />
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
                      <FormLabel className="text-xs font-semibold text-slate-300">Image Source & Preview</FormLabel>
                      <FormControl>
                        <Tabs defaultValue="upload" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800 mb-3">
                            <TabsTrigger value="upload" className="flex items-center gap-2 text-xs">
                              <Upload className="w-3.5 h-3.5" />
                              Replace File
                            </TabsTrigger>
                            <TabsTrigger value="url" className="flex items-center gap-2 text-xs">
                              <LinkIcon className="w-3.5 h-3.5" />
                              Image URL
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="upload" className="space-y-3">
                            <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center bg-slate-950/60">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, editForm);
                                  }
                                }}
                                disabled={uploadingFile}
                                className="cursor-pointer text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-400"
                              />
                              {uploadingFile && (
                                <p className="text-xs text-orange-400 mt-2 animate-pulse">Uploading file...</p>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="url">
                            <Input 
                              placeholder="https://... or /uploads/gallery/..." 
                              {...field} 
                              className="bg-slate-950 border-slate-800 text-sm"
                            />
                          </TabsContent>
                        </Tabs>
                      </FormControl>
                      <FormMessage />

                      {/* Edit Live Preview */}
                      {editImageUrl && (
                        <div className="mt-3 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                          <p className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-orange-400" />
                            Current Preview:
                          </p>
                          <div className="h-44 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <img 
                              src={editImageUrl} 
                              alt="Edit Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-300">Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          className="bg-slate-950 border-slate-800 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="border-t border-slate-800 pt-3">
                  <Button type="button" variant="outline" onClick={() => setEditingGallery(null)} className="border-slate-700 text-slate-300">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending || uploadingFile}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  >
                    {updateMutation.isPending ? "Updating..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default GalleryPage;