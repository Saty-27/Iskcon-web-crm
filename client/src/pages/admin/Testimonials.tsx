import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { MessageCircle, Eye, Trash2, Search, Star, Users, Plus, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
  id: number;
  name: string;
  title?: string;
  content: string;
  rating: number;
  isPublished: boolean;
  createdAt: Date;
}

const TestimonialsPage = () => {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    content: "",
    rating: 5,
    isPublished: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/admin/testimonials'],
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/testimonials/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Testimonial deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete testimonial", variant: "destructive" });
    },
  });

  const createTestimonialMutation = useMutation({
    mutationFn: async (data: { name: string; title?: string; content: string; rating: number; isPublished: boolean }) => {
      return await apiRequest("/api/admin/testimonials", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Testimonial created successfully" });
      setIsAddDialogOpen(false);
      setFormData({ name: "", title: "", content: "", rating: 5, isPublished: true });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create testimonial", variant: "destructive" });
    },
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; title?: string; content: string; rating: number; isPublished: boolean } }) => {
      return await apiRequest(`/api/admin/testimonials/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Testimonial updated successfully" });
      setIsEditDialogOpen(false);
      setEditingTestimonial(null);
      setFormData({ name: "", title: "", content: "", rating: 5, isPublished: true });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update testimonial", variant: "destructive" });
    },
  });

  // Calculate statistics
  const publishedTestimonials = testimonials.filter(t => t.isPublished);
  const draftTestimonials = testimonials.filter(t => !t.isPublished);
  const averageRating = testimonials.length > 0 
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
    : 0;

  // Filter testimonials based on search
  const filteredTestimonials = testimonials.filter(testimonial => 
    searchQuery === "" || 
    testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (testimonial.title && testimonial.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsViewDialogOpen(true);
  };

  const handleAddTestimonial = () => {
    setFormData({ name: "", title: "", content: "", rating: 5, isPublished: true });
    setIsAddDialogOpen(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      title: testimonial.title || "",
      content: testimonial.content,
      rating: testimonial.rating,
      isPublished: testimonial.isPublished
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (editingTestimonial) {
      updateTestimonialMutation.mutate({ id: editingTestimonial.id, data: formData });
    } else {
      createTestimonialMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteTestimonialMutation.mutate(id);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="bg-gray-50 min-h-screen p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6">
          {/* Statistics Cards - Modern Gradient Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Testimonials Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold mb-2">{testimonials.length}</div>
                <p className="text-indigo-100 text-sm">Total Testimonials</p>
              </div>
            </div>

            {/* Published Testimonials Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Published</span>
                </div>
                <div className="text-4xl font-bold mb-2">{publishedTestimonials.length}</div>
                <p className="text-emerald-100 text-sm">Live Testimonials</p>
              </div>
            </div>

            {/* Average Rating Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Rating</span>
                </div>
                <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                <p className="text-orange-100 text-sm">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Search Bar - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 mb-8 p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search testimonials by name or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-inner"
                />
              </div>
              <button 
                onClick={handleAddTestimonial}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Testimonial
              </button>
            </div>
          </div>

          {/* Testimonials Table - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Author</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Content</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Rating</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredTestimonials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 px-6 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No testimonials found</p>
                          <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTestimonials.map((testimonial) => (
                      <tr key={testimonial.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {testimonial.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                              {testimonial.title && (
                                <div className="text-xs text-gray-500">{testimonial.title}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="max-w-xs truncate text-gray-700 text-sm">
                            {testimonial.content}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-1">
                            {renderStars(testimonial.rating)}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                            testimonial.isPublished
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                          }`}>
                            {testimonial.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-600">
                          {formatDate(testimonial.createdAt)}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewTestimonial(testimonial)}
                              className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditTestimonial(testimonial)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(testimonial.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* View Testimonial Dialog - Modern Design */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl border-0 rounded-3xl shadow-2xl bg-white backdrop-blur-sm">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                Testimonial Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedTestimonial && (
              <div className="space-y-6 py-6">
                {/* Author Info Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedTestimonial.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedTestimonial.name}</h3>
                      {selectedTestimonial.title && (
                        <p className="text-indigo-600 font-medium">{selectedTestimonial.title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</label>
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(selectedTestimonial.rating)}
                        <span className="ml-2 text-lg font-bold text-gray-900">{selectedTestimonial.rating}/5</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full shadow-sm mt-1 ${
                        selectedTestimonial.isPublished
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                      }`}>
                        {selectedTestimonial.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Testimonial Content */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Testimonial Content</label>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedTestimonial.content}</p>
                  </div>
                </div>
                
                {/* Date */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Created</label>
                  <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(selectedTestimonial.createdAt)}</p>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-6 border-t border-gray-100">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Close Details
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Testimonial Dialog */}
        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingTestimonial(null);
            setFormData({ name: "", title: "", content: "", rating: 5, isPublished: true });
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Author name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Author title or designation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write the testimonial content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-1 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600">({formData.rating}/5)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="isPublished">Published</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingTestimonial(null);
                  setFormData({ name: "", title: "", content: "", rating: 5, isPublished: true });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
              >
                {createTestimonialMutation.isPending || updateTestimonialMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TestimonialsPage;