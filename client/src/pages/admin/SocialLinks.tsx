import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Link2, Eye, Trash2, Search, Globe, ExternalLink, Plus, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  isActive: boolean;
  createdAt: Date;
  icon?: string;
}

const SocialLinksPage = () => {
  const [selectedLink, setSelectedLink] = useState<SocialLink | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    isActive: true,
    icon: ""
  });
  const [uploadingIcon, setUploadingIcon] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialLinks = [], isLoading } = useQuery<SocialLink[]>({
    queryKey: ['/api/social-links'],
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/social-links/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-links'] });
      toast({ title: "Success", description: "Social link deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete social link", variant: "destructive" });
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: { platform: string; url: string; isActive: boolean; icon?: string }) => {
      return await apiRequest("/api/social-links", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-links'] });
      toast({ title: "Success", description: "Social link created successfully" });
      setIsAddDialogOpen(false);
      setFormData({ platform: "", url: "", isActive: true, icon: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create social link", variant: "destructive" });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { platform: string; url: string; isActive: boolean; icon?: string } }) => {
      return await apiRequest(`/api/social-links/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-links'] });
      toast({ title: "Success", description: "Social link updated successfully" });
      setIsEditDialogOpen(false);
      setEditingLink(null);
      setFormData({ platform: "", url: "", isActive: true, icon: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update social link", variant: "destructive" });
    },
  });

  // Calculate statistics
  const activeLinks = socialLinks.filter(link => link.isActive);
  const inactiveLinks = socialLinks.filter(link => !link.isActive);
  const platforms = [...new Set(socialLinks.map(link => link.platform))];

  // Filter links based on search
  const filteredLinks = socialLinks.filter(link => 
    searchQuery === "" || 
    link.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewLink = (link: SocialLink) => {
    setSelectedLink(link);
    setIsViewDialogOpen(true);
  };

  const handleAddLink = () => {
    setFormData({ platform: "", url: "", isActive: true, icon: "" });
    setIsAddDialogOpen(true);
  };

  const handleEditLink = (link: SocialLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      url: link.url,
      isActive: link.isActive,
      icon: link.icon || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleIconUpload = async (file: File) => {
    try {
      setUploadingIcon(true);
      
      const formData = new FormData();
      formData.append('icon', file);
      
      const response = await fetch('/api/upload/social-icon', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, icon: data.url }));
      toast({ title: "Success", description: "Icon uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload icon", variant: "destructive" });
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.platform || !formData.url) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, data: formData });
    } else {
      createLinkMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this social link?")) {
      deleteLinkMutation.mutate(id);
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

  const getPlatformColor = (platform: string) => {
    const colors = {
      facebook: 'from-blue-600 to-blue-700',
      twitter: 'from-sky-400 to-sky-500',
      instagram: 'from-pink-500 to-purple-600',
      youtube: 'from-red-500 to-red-600',
      linkedin: 'from-blue-600 to-blue-800',
      whatsapp: 'from-green-500 to-green-600',
      telegram: 'from-blue-400 to-blue-500',
      default: 'from-gray-500 to-gray-600'
    };
    return colors[platform.toLowerCase()] || colors.default;
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
            {/* Total Links Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Link2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold mb-2">{socialLinks.length}</div>
                <p className="text-cyan-100 text-sm">Total Links</p>
              </div>
            </div>

            {/* Active Links Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Active</span>
                </div>
                <div className="text-4xl font-bold mb-2">{activeLinks.length}</div>
                <p className="text-emerald-100 text-sm">Active Links</p>
              </div>
            </div>

            {/* Platforms Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Platforms</span>
                </div>
                <div className="text-4xl font-bold mb-2">{platforms.length}</div>
                <p className="text-violet-100 text-sm">Unique Platforms</p>
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
                  placeholder="Search by platform or URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-inner"
                />
              </div>
              <button 
                onClick={handleAddLink}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Social Link
              </button>
            </div>
          </div>

          {/* Social Links Table - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Platform</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">URL</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Created</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLinks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 px-6 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Link2 className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No social links found</p>
                          <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${getPlatformColor(link.platform)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                              {link.platform.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm capitalize">{link.platform}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="max-w-xs truncate text-blue-600 text-sm hover:text-blue-800">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              {link.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                            link.isActive
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                          }`}>
                            {link.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-600">
                          {formatDate(link.createdAt)}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewLink(link)}
                              className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditLink(link)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(link.id)}
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

        {/* View Social Link Dialog - Modern Design */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl border-0 rounded-3xl shadow-2xl bg-white backdrop-blur-sm">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-white" />
                </div>
                Social Link Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedLink && (
              <div className="space-y-6 py-6">
                {/* Platform Info Section */}
                <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getPlatformColor(selectedLink.platform)} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                      {selectedLink.platform.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 capitalize">{selectedLink.platform}</h3>
                      <p className="text-cyan-600 font-medium">Social Media Platform</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">URL</label>
                      <div className="mt-2">
                        <a 
                          href={selectedLink.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 break-all"
                        >
                          {selectedLink.url}
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status and Date */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Status</label>
                    <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                      selectedLink.isActive
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                        : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    }`}>
                      {selectedLink.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Created</label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(selectedLink.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-6 border-t border-gray-100">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Close Details
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Social Link Dialog */}
        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingLink(null);
            setFormData({ platform: "", url: "", isActive: true, icon: "" });
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? 'Edit Social Link' : 'Add Social Link'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  placeholder="e.g., Facebook, Twitter, Instagram"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="icon">Icon</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="icon"
                    placeholder="Icon URL or upload an icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Validate file size (1MB limit)
                          if (file.size > 1024 * 1024) {
                            toast({
                              title: 'File too large',
                              description: 'Please select an image smaller than 1MB',
                              variant: 'destructive',
                            });
                            return;
                          }
                          handleIconUpload(file);
                        }
                      };
                      input.click();
                    }}
                    disabled={uploadingIcon}
                  >
                    {uploadingIcon ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Icon'
                    )}
                  </Button>
                </div>
                
                {formData.icon && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Icon Preview:</div>
                    <img 
                      src={formData.icon} 
                      alt="Icon preview" 
                      className="w-8 h-8 object-cover rounded border border-gray-300"
                      onError={(e) => {
                        console.log('Icon image failed to load:', formData.icon);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingLink(null);
                  setFormData({ platform: "", url: "", isActive: true, icon: "" });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={createLinkMutation.isPending || updateLinkMutation.isPending}
              >
                {createLinkMutation.isPending || updateLinkMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default SocialLinksPage;