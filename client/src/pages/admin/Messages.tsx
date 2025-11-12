import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Mail, Eye, Trash2, Search, MessageSquare, Clock, CheckCircle, MailOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const MessagesPage = () => {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/contact-messages/${id}/read`, "PUT");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      toast({ title: "Success", description: "Message marked as read" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark message as read", variant: "destructive" });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/contact-messages/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      toast({ title: "Success", description: "Message deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    },
  });

  // Calculate statistics
  const unreadMessages = messages.filter(m => !m.isRead);
  const readMessages = messages.filter(m => m.isRead);

  // Filter messages based on search
  const filteredMessages = messages.filter(message => 
    searchQuery === "" || 
    message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(id);
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
            {/* Total Messages Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold mb-2">{messages.length}</div>
                <p className="text-blue-100 text-sm">Total Messages</p>
              </div>
            </div>

            {/* Unread Messages Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Unread</span>
                </div>
                <div className="text-4xl font-bold mb-2">{unreadMessages.length}</div>
                <p className="text-orange-100 text-sm">Need Attention</p>
              </div>
            </div>

            {/* Read Messages Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MailOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Read</span>
                </div>
                <div className="text-4xl font-bold mb-2">{readMessages.length}</div>
                <p className="text-emerald-100 text-sm">Processed</p>
              </div>
            </div>
          </div>

          {/* Search Bar - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 mb-8 p-6 backdrop-blur-sm">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-inner"
              />
            </div>
          </div>

          {/* Messages Table - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Contact</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Subject</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 px-6 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No messages found</p>
                          <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="py-5 px-6">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                            message.isRead
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                          }`}>
                            {message.isRead ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {message.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{message.name}</div>
                              <div className="text-xs text-gray-500">{message.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="max-w-xs truncate font-medium text-gray-900 text-sm">
                            {message.subject}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-600">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewMessage(message)}
                              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Eye className="h-3 w-3 mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(message.id)}
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

        {/* View Message Dialog - Modern Design */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl border-0 rounded-3xl shadow-2xl bg-white backdrop-blur-sm">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                Message Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-6 py-6">
                {/* Contact Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedMessage.name}</h3>
                      <p className="text-blue-600 font-medium">{selectedMessage.email}</p>
                      {selectedMessage.phone && (
                        <p className="text-gray-600 text-sm">{selectedMessage.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMessage.subject}</p>
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Message</label>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                {/* Date & Status */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Received</label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Status</label>
                    <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                      selectedMessage.isRead
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                    }`}>
                      {selectedMessage.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-6 border-t border-gray-100">
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Close Message
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MessagesPage;