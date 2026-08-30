import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Banner, insertBannerSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Monitor, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Sparkles
} from "lucide-react";

interface SelectedFileMetadata {
  file: File;
  name: string;
  size: number;
  width?: number;
  height?: number;
  isValid: boolean;
  validationError?: string;
}

const MAX_BANNER_SIZE = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)

const BannersPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [fileMeta, setFileMeta] = useState<SelectedFileMetadata | null>(null);

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fresh live fetching with timestamp cache-buster & no stale state
  const { data: banners = [], isLoading, refetch } = useQuery<Banner[]>({
    queryKey: ['/api/banners', selectedFilter],
    queryFn: async () => {
      const url = selectedFilter === 'all' 
        ? '/api/banners?admin=true' 
        : `/api/banners?admin=true&screenType=${selectedFilter}`;
      const res = await fetch(`${url}&_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to load banners');
      return res.json();
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const createForm = useForm({
    resolver: zodResolver(insertBannerSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      imageAlt: "",
      buttonText: "",
      buttonLink: "",
      screenType: "desktop",
      isActive: true,
      order: 0,
    },
  });

  const editForm = useForm({
    resolver: zodResolver(insertBannerSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      imageAlt: "",
      buttonText: "",
      buttonLink: "",
      screenType: "desktop",
      isActive: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/banners', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      refetch();
      setIsCreateOpen(false);
      createForm.reset();
      setFileMeta(null);
      toast({ title: "Success", description: "Banner created successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to create banner", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/banners/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      refetch();
      setEditingBanner(null);
      editForm.reset();
      setFileMeta(null);
      toast({ title: "Success", description: "Banner updated successfully" });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to update banner", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/banners/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      refetch();
      toast({ title: "Success", description: "Banner deleted permanently" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to delete banner", variant: "destructive" });
    },
  });

  // Client-side file inspection & dimension validation
  const validateAndProcessFile = (file: File, targetScreenType: 'desktop' | 'mobile'): Promise<SelectedFileMetadata> => {
    return new Promise((resolve) => {
      // 1. File size check (< 1 MB)
      if (file.size > MAX_BANNER_SIZE) {
        resolve({
          file,
          name: file.name,
          size: file.size,
          isValid: false,
          validationError: `File is ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum allowed size is 1 MB.`
        });
        return;
      }

      // If video media
      if (file.type.startsWith('video/')) {
        resolve({
          file,
          name: file.name,
          size: file.size,
          isValid: true
        });
        return;
      }

      // 2. Image dimension check
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        URL.revokeObjectURL(objectUrl);

        let isValid = true;
        let validationError: string | undefined = undefined;

        if (targetScreenType === 'desktop') {
          const ratio = width / height;
          const isExpectedRatio = Math.abs(ratio - (16 / 9)) < 0.1;
          const isStandardSize = (width === 1920 && height === 1080) || isExpectedRatio;

          if (!isStandardSize) {
            isValid = false;
            validationError = `Invalid dimensions: ${width} × ${height} px. Desktop banners must be 1920 × 1080 px (16:9).`;
          }
        } else {
          const ratio = width / height;
          const isExpectedRatio = Math.abs(ratio - (9 / 16)) < 0.1;
          const isStandardSize = (width === 1080 && height === 1920) || isExpectedRatio;

          if (!isStandardSize) {
            isValid = false;
            validationError = `Invalid dimensions: ${width} × ${height} px. Mobile banners must be 1080 × 1920 px (9:16).`;
          }
        }

        resolve({
          file,
          name: file.name,
          size: file.size,
          width,
          height,
          isValid,
          validationError
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          file,
          name: file.name,
          size: file.size,
          isValid: false,
          validationError: 'Unable to read image dimensions. Please ensure file is a valid image.'
        });
      };

      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (file: File, form: any) => {
    const currentScreenType = (form.getValues('screenType') || 'desktop') as 'desktop' | 'mobile';
    
    // Inspect file
    const meta = await validateAndProcessFile(file, currentScreenType);
    setFileMeta(meta);

    if (!meta.isValid) {
      toast({
        title: "Validation Warning",
        description: meta.validationError,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('file', file);
      formData.append('type', 'banner');
      formData.append('screenType', currentScreenType);
      
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/upload/banner', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Upload failed');
      }
      
      const result = await response.json();
      const uploadedUrl = result.imageUrl || result.url;
      form.setValue('imageUrl', uploadedUrl);
      toast({ title: "Success", description: "Banner media uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload Error", description: error?.message || "Failed to upload banner", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFileMeta(null);
    editForm.reset({
      title: banner.title,
      description: banner.description ?? "",
      imageUrl: banner.imageUrl,
      imageAlt: banner.imageAlt ?? "",
      buttonText: banner.buttonText ?? "",
      buttonLink: banner.buttonLink ?? "",
      screenType: banner.screenType || "desktop",
      isActive: banner.isActive,
      order: banner.order ?? 0,
    });
  };

  const handleUpdate = (data: any) => {
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this banner? It will be removed permanently from the database and storage.')) {
      deleteMutation.mutate(id);
    }
  };

  const desktopCount = banners.filter(b => b.screenType === 'desktop' || !b.screenType).length;
  const mobileCount = banners.filter(b => b.screenType === 'mobile').length;

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        
        {/* Header with Title & Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-orange-500" />
              Hero Banner Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure homepage banners for Desktop (1920×1080) and Mobile (1080×1920) displays with 1 MB strict limits.
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setFileMeta(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Add New Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Create New Hero Banner
                </DialogTitle>
              </DialogHeader>

              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                  
                  {/* Screen Type Selector */}
                  <FormField
                    control={createForm.control}
                    name="screenType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-800">Display Device / Target Screen</FormLabel>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => { field.onChange('desktop'); setFileMeta(null); }}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              field.value === 'desktop'
                                ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Monitor className={`w-5 h-5 ${field.value === 'desktop' ? 'text-orange-600' : 'text-gray-400'}`} />
                            <div>
                              <p className="text-xs font-bold text-gray-900">Desktop Banner</p>
                              <p className="text-[11px] text-gray-500">1920 × 1080 px (16:9)</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => { field.onChange('mobile'); setFileMeta(null); }}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              field.value === 'mobile'
                                ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Smartphone className={`w-5 h-5 ${field.value === 'mobile' ? 'text-orange-600' : 'text-gray-400'}`} />
                            <div>
                              <p className="text-xs font-bold text-gray-900">Mobile Banner</p>
                              <p className="text-[11px] text-gray-500">1080 × 1920 px (9:16)</p>
                            </div>
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dimension & Size Requirement Banner */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11.5px] text-amber-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      {createForm.watch('screenType') === 'mobile' ? 'Mobile Banner Requirements:' : 'Desktop Banner Requirements:'}
                    </p>
                    <p>
                      • <strong>Resolution:</strong> {createForm.watch('screenType') === 'mobile' ? '1080 × 1920 px (9:16 aspect ratio)' : '1920 × 1080 px (16:9 aspect ratio)'}
                    </p>
                    <p>• <strong>Max File Size:</strong> 1 MB (1,048,576 bytes) • JPEG, PNG, WebP</p>
                  </div>

                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Sri Krishna Janmashtami Mahotsav" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle / Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief devotional context or dates" {...field} rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Banner Media Upload Section */}
                  <div className="space-y-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-semibold text-gray-900">Banner Media</FormLabel>
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          variant={uploadMethod === 'file' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUploadMethod('file')}
                          className="h-8 text-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={uploadMethod === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUploadMethod('url')}
                          className="h-8 text-xs cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5 mr-1" />
                          Image URL
                        </Button>
                      </div>
                    </div>

                    {uploadMethod === 'file' ? (
                      <div className="space-y-3">
                        <input
                          ref={createFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, createForm);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => createFileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full h-12 border-dashed border-2 border-orange-300 bg-white hover:bg-orange-50 text-orange-700 rounded-xl cursor-pointer"
                        >
                          {isUploading ? 'Uploading & validating...' : 'Select Banner Image (Max 1 MB)'}
                        </Button>

                        {/* File Details & Live Validation Stats */}
                        {fileMeta && (
                          <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                            fileMeta.isValid ? 'bg-green-50/80 border-green-200 text-green-900' : 'bg-red-50/80 border-red-200 text-red-900'
                          }`}>
                            <div className="flex items-center justify-between font-semibold">
                              <span className="truncate max-w-[240px]">{fileMeta.name}</span>
                              <span className="flex items-center gap-1">
                                {fileMeta.isValid ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    Valid ({fileMeta.width}×{fileMeta.height})
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    Invalid
                                  </>
                                )}
                              </span>
                            </div>
                            <p className="text-[11px] opacity-80">
                              Size: {(fileMeta.size / 1024).toFixed(1)} KB
                              {fileMeta.width ? ` • Resolution: ${fileMeta.width} × ${fileMeta.height} px` : ''}
                            </p>
                            {fileMeta.validationError && (
                              <p className="text-[11px] font-medium text-red-700 pt-0.5">
                                ⚠️ {fileMeta.validationError}
                              </p>
                            )}
                          </div>
                        )}

                        <FormField
                          control={createForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Uploaded URL will appear here"
                                  {...field}
                                  readOnly
                                  className="bg-white text-xs text-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <FormField
                        control={createForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="https://example.com/banner-1920x1080.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={createForm.control}
                      name="buttonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Donate Now" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="buttonLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Link (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="/donate" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <FormField
                      control={createForm.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl border p-3 mt-5">
                          <FormLabel className="text-xs font-semibold">Active Status</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || isUploading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 shadow-md cursor-pointer"
                  >
                    {createMutation.isPending ? "Creating Banner..." : "Publish Banner"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Top Filters & Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              selectedFilter === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Banners
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-current">
              {banners.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('desktop')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              selectedFilter === 'desktop'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop (1920×1080)
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-current">
              {desktopCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              selectedFilter === 'mobile'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile (1080×1920)
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-current">
              {mobileCount}
            </span>
          </button>
        </div>

        {/* Banners List */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center text-gray-500 space-y-3">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="text-base font-semibold text-gray-700">No Banners Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                No hero banners configured for this filter. Click &ldquo;Add New Banner&rdquo; to publish one.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {banners.map((banner) => {
                const isMobileBanner = banner.screenType === 'mobile';

                return (
                  <div key={banner.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-orange-50/20 transition-colors">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Image Thumbnail with Aspect Ratio Preview */}
                      <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className={`${
                            isMobileBanner ? 'w-14 h-24 object-cover' : 'w-28 h-16 object-cover'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {banner.title || 'Untitled Banner'}
                          </h3>
                          
                          {/* Device Badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isMobileBanner
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {isMobileBanner ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                            {isMobileBanner ? 'Mobile (9:16)' : 'Desktop (16:9)'}
                          </span>

                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            banner.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {banner.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {banner.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                          {banner.buttonText && (
                            <span>Button: <strong className="text-gray-700">{banner.buttonText}</strong></span>
                          )}
                          {banner.buttonLink && (
                            <span>Link: <code className="text-orange-600">{banner.buttonLink}</code></span>
                          )}
                          <span>Order: <strong>{banner.order}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                        className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-gray-200 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Banner Dialog */}
        <Dialog open={!!editingBanner} onOpenChange={() => { setEditingBanner(null); setFileMeta(null); }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Edit Hero Banner
              </DialogTitle>
            </DialogHeader>

            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
                
                {/* Screen Type Selector */}
                <FormField
                  control={editForm.control}
                  name="screenType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-800">Display Device / Target Screen</FormLabel>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => { field.onChange('desktop'); setFileMeta(null); }}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            field.value === 'desktop'
                              ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Monitor className={`w-5 h-5 ${field.value === 'desktop' ? 'text-orange-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="text-xs font-bold text-gray-900">Desktop Banner</p>
                            <p className="text-[11px] text-gray-500">1920 × 1080 px (16:9)</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => { field.onChange('mobile'); setFileMeta(null); }}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            field.value === 'mobile'
                              ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Smartphone className={`w-5 h-5 ${field.value === 'mobile' ? 'text-orange-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="text-xs font-bold text-gray-900">Mobile Banner</p>
                            <p className="text-[11px] text-gray-500">1080 × 1920 px (9:16)</p>
                          </div>
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Banner title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Banner description" {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Banner Media Upload Section */}
                <div className="space-y-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold text-gray-900">Banner Media</FormLabel>
                    <div className="flex space-x-1">
                      <Button
                        type="button"
                        variant={uploadMethod === 'file' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUploadMethod('file')}
                        className="h-8 text-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant={uploadMethod === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUploadMethod('url')}
                        className="h-8 text-xs cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5 mr-1" />
                        Image URL
                      </Button>
                    </div>
                  </div>

                  {uploadMethod === 'file' ? (
                    <div className="space-y-3">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, editForm);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full h-12 border-dashed border-2 border-orange-300 bg-white hover:bg-orange-50 text-orange-700 rounded-xl cursor-pointer"
                      >
                        {isUploading ? 'Uploading...' : 'Replace Banner Image (Max 1 MB)'}
                      </Button>

                      {fileMeta && (
                        <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                          fileMeta.isValid ? 'bg-green-50/80 border-green-200 text-green-900' : 'bg-red-50/80 border-red-200 text-red-900'
                        }`}>
                          <div className="flex items-center justify-between font-semibold">
                            <span className="truncate max-w-[240px]">{fileMeta.name}</span>
                            <span className="flex items-center gap-1">
                              {fileMeta.isValid ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                              {fileMeta.isValid ? `Valid (${fileMeta.width}×${fileMeta.height})` : 'Invalid'}
                            </span>
                          </div>
                          {fileMeta.validationError && (
                            <p className="text-[11px] font-medium text-red-700 pt-0.5">
                              ⚠️ {fileMeta.validationError}
                            </p>
                          )}
                        </div>
                      )}

                      <FormField
                        control={editForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Image URL"
                                {...field}
                                readOnly
                                className="bg-white text-xs text-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <FormField
                      control={editForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="https://example.com/banner.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={editForm.control}
                    name="buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Learn More" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="buttonLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Link</FormLabel>
                        <FormControl>
                          <Input placeholder="/donate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <FormField
                    control={editForm.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-xl border p-3 mt-5">
                        <FormLabel className="text-xs font-semibold">Active Status</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || isUploading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 shadow-md cursor-pointer"
                >
                  {updateMutation.isPending ? "Updating Banner..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default BannersPage;