import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlogPostSchema, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, FileText, Clock, Globe, Image } from "lucide-react";
import { z } from "zod";

const blogFormSchema = insertBlogPostSchema.omit({ imageUrl: true }).extend({
  imageFile: z.any().optional(),
  imageUrl: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

export default function BlogManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();

  // Form setup
  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      imageAlt: "",
      author: "",
      readTime: 1,
      isPublished: false,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
  });

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Update slug when title changes
  useState(() => {
    if (watchTitle && !editingBlog) {
      form.setValue("slug", generateSlug(watchTitle));
    }
  });

  // Fetch blog posts
  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog-posts"],
  });

  // Create blog post mutation
  const createMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      let imageUrl = '';
      
      // Priority: File upload first, then URL
      if (data.imageFile && data.imageFile[0]) {
        const file = data.imageFile[0];
        
        // Check file size (1MB limit)
        const maxSize = 1 * 1024 * 1024; // 1MB in bytes
        if (file.size > maxSize) {
          throw new Error('Image file size must be less than 1MB');
        }
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "blog");
        const uploadResponse = await apiRequest("/api/upload", "POST", formData);
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      } else if (data.imageUrl) {
        imageUrl = data.imageUrl;
      }

      // Ensure we have a valid imageUrl
      if (!imageUrl) {
        throw new Error('Image is required for blog post');
      }

      const blogData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        imageUrl: imageUrl,
        imageAlt: data.imageAlt || '',
        author: data.author,
        readTime: data.readTime,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date().toISOString() : null,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
      };

      await apiRequest("/api/admin/blog-posts", "POST", blogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      form.reset();
      setImagePreview("");
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  // Update blog post mutation
  const updateMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      let imageUrl = '';
      
      // Priority: File upload first, then URL, then existing image
      if (data.imageFile && data.imageFile[0]) {
        const file = data.imageFile[0];
        
        // Check file size (1MB limit)
        const maxSize = 1 * 1024 * 1024; // 1MB in bytes
        if (file.size > maxSize) {
          throw new Error('Image file size must be less than 1MB');
        }
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "blog");
        const uploadResponse = await apiRequest("/api/upload", "POST", formData);
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      } else if (data.imageUrl) {
        imageUrl = data.imageUrl;
      } else if (editingBlog?.imageUrl) {
        imageUrl = editingBlog.imageUrl;
      }

      // Ensure we have a valid imageUrl
      if (!imageUrl) {
        throw new Error('Image is required for blog post');
      }

      const blogData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        imageUrl: imageUrl,
        imageAlt: data.imageAlt || '',
        author: data.author,
        readTime: data.readTime,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date().toISOString() : editingBlog?.publishedAt,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || '',
      };

      console.log('Updating blog post:', editingBlog?.id, 'with data:', blogData);
      console.log('ImageUrl being sent:', imageUrl);
      console.log('ImageUrl type:', typeof imageUrl);
      console.log('ImageUrl length:', imageUrl?.length);
      
      await apiRequest(`/api/admin/blog-posts/${editingBlog?.id}`, "PUT", blogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      form.reset();
      setImagePreview("");
      setEditingBlog(null);
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  // Delete blog post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/blog-posts/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: BlogFormData) => {
    if (editingBlog) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle edit
  const handleEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    form.reset({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      imageUrl: blog.imageUrl,
      imageAlt: blog.imageAlt || "",
      author: blog.author,
      readTime: blog.readTime,
      isPublished: blog.isPublished,
      seoTitle: blog.seoTitle || "",
      seoDescription: blog.seoDescription || "",
      seoKeywords: blog.seoKeywords || "",
    });
    setImagePreview(blog.imageUrl);
  };

  // Handle image file selection
  const handleImageSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form and close dialog
  const resetForm = () => {
    form.reset();
    setImagePreview("");
    setEditingBlog(null);
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="bg-gray-50 min-h-screen p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            </div>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <Dialog open={isCreateDialogOpen || !!editingBlog} onOpenChange={(open) => {
              if (!open) resetForm();
              else setIsCreateDialogOpen(true);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter blog post title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="url-friendly-slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the blog post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Full blog post content (supports HTML)" 
                          className="min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    <Label className="text-base font-medium">Featured Image</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imageFile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload New Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                field.onChange(e.target.files);
                                handleImageSelect(e.target.files);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Or Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value) setImagePreview(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageAlt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Alt Text (SEO)</FormLabel>
                        <FormControl>
                          <Input placeholder="Descriptive text for accessibility and SEO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {imagePreview && (
                    <div className="mt-4">
                      <Label>Image Preview</Label>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mt-2 max-w-xs h-auto rounded-md border"
                      />
                    </div>
                  )}
                </div>

                {/* Author and Read Time */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author *</FormLabel>
                        <FormControl>
                          <Input placeholder="Author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="readTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Read Time (minutes) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SEO Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <Label className="text-base font-medium">SEO Optimization</Label>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title (60 chars max)</FormLabel>
                        <FormControl>
                          <Input placeholder="SEO optimized title for search engines" {...field} />
                        </FormControl>
                        <div className="text-sm text-gray-500">
                          {field.value?.length || 0}/60 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description (160 chars max)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Meta description for search engine results"
                            {...field} 
                          />
                        </FormControl>
                        <div className="text-sm text-gray-500">
                          {field.value?.length || 0}/160 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Keywords (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="spiritual, meditation, dharma, krishna" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Publishing Options */}
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publish Blog Post</FormLabel>
                        <div className="text-sm text-gray-500">
                          Make this blog post visible on the website
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    )}
                    {editingBlog ? "Update" : "Create"} Blog Post
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog Posts List */}
      <div className="grid gap-4">
        {blogPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first blog post</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                Create Blog Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          blogPosts.map((blog: BlogPost) => (
            <Card key={blog.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
                      <Badge variant={blog.isPublished ? "default" : "secondary"}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {blog.seoTitle && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          SEO
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{blog.excerpt}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {blog.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {blog.readTime} min read
                      </span>
                      {blog.publishedAt && (
                        <span>
                          Published {new Date(blog.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {blog.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={blog.imageUrl} 
                          alt={blog.imageAlt || blog.title}
                          className="w-24 h-16 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {blog.isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(blog)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this blog post?")) {
                          deleteMutation.mutate(blog.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
        </div>
      </div>
    </AdminLayout>
  );
}