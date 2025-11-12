import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Search, 
  Eye, 
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp,
  IndianRupee
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Donation {
  id: number;
  name: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  createdAt: Date;
  paymentId?: string;
  categoryId?: number;
  eventId?: number;
  categoryName?: string;
  eventTitle?: string;
}

const DonationsPage = () => {
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: donations = [], isLoading, refetch } = useQuery<Donation[]>({
    queryKey: ['/api/admin/donations'],
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data (gcTime is the new name for cacheTime)
  });



  // Force refresh on page load
  React.useEffect(() => {
    const forceRefresh = () => {
      queryClient.removeQueries({ queryKey: ['/api/admin/donations'] });
      refetch();
    };
    forceRefresh();
  }, [queryClient, refetch]);

  const deleteDonationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/donations/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/donations'] });
      toast({ title: "Success", description: "Donation deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete donation", variant: "destructive" });
    },
  });

  // Calculate real donation statistics
  const completedDonations = donations.filter(d => d.status === 'completed');
  const pendingDonations = donations.filter(d => d.status === 'pending');
  const failedDonations = donations.filter(d => d.status === 'failed');
  const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0);

  // Filter donations based on search and filters
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = searchQuery === "" || 
      donation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.phone.includes(searchQuery) ||
      (donation.paymentId && donation.paymentId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || donation.status === statusFilter;
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "category" && donation.categoryName) ||
      (typeFilter === "event" && donation.eventTitle);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this donation?")) {
      deleteDonationMutation.mutate(id);
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="bg-gray-50 min-h-screen p-2.5">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
        <div className="p-2.5">
          {/* Summary Cards Grid - Modern Gradient Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold mb-2">{donations.length}</div>
                <p className="text-purple-100 text-sm">Total Donations</p>
              </div>
            </div>

            {/* Completed Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Success</span>
                </div>
                <div className="text-4xl font-bold mb-2">{completedDonations.length}</div>
                <p className="text-emerald-100 text-sm">Completed</p>
              </div>
            </div>

            {/* Pending Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Waiting</span>
                </div>
                <div className="text-4xl font-bold mb-2">{pendingDonations.length}</div>
                <p className="text-orange-100 text-sm">Pending</p>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <IndianRupee className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Revenue</span>
                </div>
                <div className="text-4xl font-bold mb-2">₹{totalAmount.toLocaleString()}</div>
                <p className="text-blue-100 text-sm">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Search + Filters Bar - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 mb-8 p-6 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by donor name, email, phone, or payment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-inner"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="relative">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 h-12 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-purple-500 shadow-inner">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="border-0 shadow-xl rounded-xl">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40 h-12 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-purple-500 shadow-inner">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="border-0 shadow-xl rounded-xl">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Donations Table - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">ID</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Donor</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Category</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 px-6 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No donations found</p>
                          <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="py-5 px-6">
                          <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            #{donation.id}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {donation.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{donation.name}</div>
                              <div className="text-xs text-gray-500">{donation.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {donation.categoryName ? 'Category' : donation.eventTitle ? 'Event' : 'General'}
                            </span>
                            {donation.categoryName && (
                              <span className="text-xs text-gray-500 truncate max-w-32">
                                {donation.categoryName}
                              </span>
                            )}
                            {donation.eventTitle && (
                              <span className="text-xs text-gray-500 truncate max-w-32">
                                {donation.eventTitle}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-bold text-gray-900 text-lg">₹{donation.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-600">
                          {formatDate(donation.createdAt)}
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex px-4 py-2 text-xs font-bold rounded-full shadow-sm ${
                            donation.status === 'completed'
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                              : donation.status === 'pending'
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                              : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                          }`}>
                            {donation.status === 'completed' ? 'Completed' : 
                             donation.status === 'pending' ? 'Pending' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewDonation(donation)}
                              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Eye className="h-3 w-3 mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(donation.id)}
                              className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
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

        {/* View Donation Dialog - Modern Design */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl border-0 rounded-3xl shadow-2xl bg-white backdrop-blur-sm">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                Donation Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedDonation && (
              <div className="space-y-6 py-6">
                {/* Donor Info Section */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedDonation.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedDonation.name}</h3>
                      <p className="text-purple-600 font-medium">{selectedDonation.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{selectedDonation.phone}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Donation Amount</label>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">₹{selectedDonation.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(selectedDonation.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Status</label>
                    <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                      selectedDonation.status === 'completed'
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                        : selectedDonation.status === 'pending'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    }`}>
                      {selectedDonation.status === 'completed' ? 'Completed' : 
                       selectedDonation.status === 'pending' ? 'Pending' : 'Failed'}
                    </span>
                  </div>
                </div>
                
                {selectedDonation.paymentId && (
                  <div className="bg-blue-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Payment ID</label>
                    <p className="text-sm mt-2 font-mono bg-white px-4 py-3 rounded-xl border border-blue-200 text-gray-800 break-all">
                      {selectedDonation.paymentId}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="pt-6 border-t border-gray-100">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Close Details
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default DonationsPage;