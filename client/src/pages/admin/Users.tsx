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
import { Users, Eye, Trash2, Search, UserCheck, UserX, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  role?: string;
}

const UsersPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/users/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    },
  });

  // Calculate statistics
  const activeUsers = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);
  const adminUsers = users.filter(u => u.role === 'admin' || u.username === 'admin');

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    searchQuery === "" || 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
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
            {/* Total Users Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold mb-2">{users.length}</div>
                <p className="text-purple-100 text-sm">Total Users</p>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Active</span>
                </div>
                <div className="text-4xl font-bold mb-2">{activeUsers.length}</div>
                <p className="text-emerald-100 text-sm">Active Users</p>
              </div>
            </div>

            {/* Admin Users Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Admins</span>
                </div>
                <div className="text-4xl font-bold mb-2">{adminUsers.length}</div>
                <p className="text-orange-100 text-sm">Administrators</p>
              </div>
            </div>
          </div>

          {/* Search Bar - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 mb-8 p-6 backdrop-blur-sm">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-inner"
              />
            </div>
          </div>

          {/* Users Table - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">User</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Role</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Created</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 px-6 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{user.username}</div>
                              {user.email && (
                                <div className="text-xs text-gray-500">{user.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' || user.username === 'admin'
                              ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'admin' || user.username === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                            user.isActive
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Eye className="h-3 w-3 mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
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

        {/* View User Dialog - Modern Design */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl border-0 rounded-3xl shadow-2xl bg-white backdrop-blur-sm">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                User Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6 py-6">
                {/* User Info Section */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedUser.username}</h3>
                      {selectedUser.email && (
                        <p className="text-purple-600 font-medium">{selectedUser.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedUser.role === 'admin' || selectedUser.username === 'admin' ? 'Administrator' : 'User'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                      <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full shadow-sm mt-1 ${
                        selectedUser.isActive
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      }`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Account Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Created</label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Login</label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                    </p>
                  </div>
                </div>
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

export default UsersPage;