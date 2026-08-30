import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import Layout from '@/components/admin/Layout';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Search, 
  Key, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Check, 
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';

interface StaffUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  role: 'super_admin' | 'admin' | string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PermissionDef {
  key: string;
  name: string;
  description: string;
  section: string;
  action: string;
}

interface SectionDef {
  id: string;
  name: string;
}

export default function StaffManagement() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'super_admin'>('admin');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Reset password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Fetch staff list
  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery<StaffUser[]>({
    queryKey: ['/api/admin/staff'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/staff', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load staff accounts');
      return res.json();
    },
  });

  // Fetch permissions dictionary
  const { data: permsData } = useQuery<{ sections: SectionDef[]; permissions: PermissionDef[] }>({
    queryKey: ['/api/admin/permissions'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/permissions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load permissions');
      return res.json();
    },
  });

  const sections = permsData?.sections || [];
  const allPermissions = permsData?.permissions || [];

  // Group permissions by section
  const permissionsBySection = sections.map((sec) => ({
    ...sec,
    perms: allPermissions.filter((p) => p.section === sec.id),
  })).filter((sec) => sec.perms.length > 0);

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create staff member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: 'Success', description: 'Staff account created successfully.' });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update staff member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: 'Success', description: 'Staff permissions updated successfully.' });
      setIsEditOpen(false);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Toggle status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/staff/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to change staff status');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: 'Status Updated', description: data.message });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: number; newPassword: string }) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/staff/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to reset password');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Staff password has been reset.' });
      setIsResetPasswordOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormRole('admin');
    setSelectedPermissions([]);
  };

  const openEditModal = (staff: StaffUser) => {
    setSelectedStaff(staff);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPhone(staff.phone || '');
    setFormRole(staff.role === 'super_admin' ? 'super_admin' : 'admin');
    setSelectedPermissions(staff.permissions || []);
    setIsEditOpen(true);
  };

  const openResetPasswordModal = (staff: StaffUser) => {
    setSelectedStaff(staff);
    setNewPassword('');
    setConfirmNewPassword('');
    setIsResetPasswordOpen(true);
  };

  // Toggle single permission checkbox
  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) => 
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  // Toggle all permissions for an entire section
  const toggleSection = (sectionPerms: PermissionDef[]) => {
    const keys = sectionPerms.map((p) => p.key);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      // Unselect all in this section
      setSelectedPermissions((prev) => prev.filter((k) => !keys.includes(k)));
    } else {
      // Add all missing in this section
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...keys])));
    }
  };

  // Presets
  const applyPreset = (preset: 'all' | 'none' | 'content' | 'finance' | 'support') => {
    if (preset === 'all') {
      setSelectedPermissions(allPermissions.map((p) => p.key));
    } else if (preset === 'none') {
      setSelectedPermissions([]);
    } else if (preset === 'content') {
      const contentKeys = allPermissions
        .filter((p) => ['banners', 'gallery', 'videos', 'quotes', 'blog'].includes(p.section))
        .map((p) => p.key);
      setSelectedPermissions(contentKeys);
    } else if (preset === 'finance') {
      const financeKeys = allPermissions
        .filter((p) => ['donations', 'categories'].includes(p.section))
        .map((p) => p.key);
      setSelectedPermissions(financeKeys);
    } else if (preset === 'support') {
      const supportKeys = allPermissions
        .filter((p) => ['chat', 'messages'].includes(p.section))
        .map((p) => p.key);
      setSelectedPermissions(supportKeys);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim() || !formEmail.trim() || !formPassword) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (formPassword !== formConfirmPassword) {
      toast({ title: 'Validation Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (formPassword.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters long.', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      name: formName.trim(),
      username: formUsername.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim() || null,
      password: formPassword,
      role: formRole,
      permissions: formRole === 'super_admin' ? ['*'] : selectedPermissions,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    updateMutation.mutate({
      id: selectedStaff.id,
      payload: {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim() || null,
        role: formRole,
        permissions: formRole === 'super_admin' ? ['*'] : selectedPermissions,
      },
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters long.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Validation Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    resetPasswordMutation.mutate({
      id: selectedStaff.id,
      newPassword,
    });
  };

  // Filter staff records
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return staff.isActive;
    if (statusFilter === 'disabled') return !staff.isActive;
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Staff & RBAC Permissions</h1>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs uppercase font-extrabold ml-2">
                Super Admin
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              Create and manage administrative staff accounts, enforce fine-grained action permissions, and protect sensitive operations.
            </p>
          </div>

          <Button 
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg shadow-orange-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Staff / Admin
          </Button>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-orange-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-400">Status:</span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${statusFilter === 'all' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                All ({staffList.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-md transition-colors ${statusFilter === 'active' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Active ({staffList.filter(s => s.isActive).length})
              </button>
              <button
                onClick={() => setStatusFilter('disabled')}
                className={`px-3 py-1 rounded-md transition-colors ${statusFilter === 'disabled' ? 'bg-red-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Disabled ({staffList.filter(s => !s.isActive).length})
              </button>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoadingStaff ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-500" />
              <p>Loading staff database...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Users className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-base font-medium text-slate-400">No staff accounts found</p>
              <p className="text-xs text-slate-600">Try adjusting your search query or create a new staff account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Staff Member</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Assigned Permissions</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-normal">
                  {filteredStaff.map((staff) => {
                    const isSuper = staff.role === 'super_admin';
                    const isPrimarySuperAdmin = staff.username === 'isk_conjuhuadmin';
                    const isSelf = currentUser?.id === staff.id;

                    return (
                      <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${
                              isSuper 
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {staff.name ? staff.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                {staff.name}
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 font-mono">@{staff.username} • {staff.email}</div>
                              {staff.phone && <div className="text-[11px] text-slate-500">{staff.phone}</div>}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-6">
                          {isSuper ? (
                            <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase">
                              Super Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase">
                              Staff Admin
                            </Badge>
                          )}
                        </td>

                        {/* Status Switch */}
                        <td className="py-4 px-6">
                          {isPrimarySuperAdmin ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              Always Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={staff.isActive}
                                onCheckedChange={(checked) => statusMutation.mutate({ id: staff.id, isActive: checked })}
                                disabled={isPrimarySuperAdmin || (isSelf && staff.isActive)}
                              />
                              <span className={`text-xs font-medium ${staff.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {staff.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Assigned Permissions */}
                        <td className="py-4 px-6">
                          {isSuper ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                              Full Unrestricted Access (*)
                            </div>
                          ) : staff.permissions && staff.permissions.length > 0 ? (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1 max-w-md">
                                {staff.permissions.slice(0, 4).map((p) => (
                                  <span key={p} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono">
                                    {p}
                                  </span>
                                ))}
                                {staff.permissions.length > 4 && (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-semibold">
                                    +{staff.permissions.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No permissions assigned</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(staff)}
                              className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white h-8 px-2.5 text-xs shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1 text-orange-400" /> Permissions
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openResetPasswordModal(staff)}
                              className="bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white h-8 px-2.5 text-xs shadow-sm"
                              disabled={isPrimarySuperAdmin && !isSelf}
                            >
                              <Key className="w-3.5 h-3.5 mr-1 text-slate-400" /> Reset Pass
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CREATE STAFF MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                Create Admin / Staff Account
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Create login credentials and select the specific sections & operations this staff member is authorized to access.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-6 pt-2">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Full Name *</Label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Username *</Label>
                  <Input
                    placeholder="e.g. john_staff"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Phone (Optional)</Label>
                  <Input
                    placeholder="+91 9876543210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                      className="bg-slate-900 border-slate-800 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Confirm Password *</Label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <Label className="text-xs font-semibold text-slate-300">Account Type / Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setFormRole('admin')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formRole === 'admin' 
                        ? 'bg-purple-600/15 border-purple-500 text-white font-semibold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formRole === 'admin' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'}`}>
                        {formRole === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      Staff Admin (Permission Restricted)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-5.5">
                      Restricted to only explicitly checked pages and actions below.
                    </p>
                  </div>

                  <div 
                    onClick={() => setFormRole('super_admin')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formRole === 'super_admin' 
                        ? 'bg-orange-600/15 border-orange-500 text-white font-semibold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formRole === 'super_admin' ? 'border-orange-400 bg-orange-500' : 'border-slate-600'}`}>
                        {formRole === 'super_admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      Super Admin (Full Unrestricted Access)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-5.5">
                      Full access to all sections, staff management, and security logs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Granular Permissions Section (Only if Staff Admin) */}
              {formRole === 'admin' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Assign Section & Action Permissions</h3>
                      <p className="text-xs text-slate-400">Select which pages and actions this admin is allowed to access.</p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      <Button type="button" size="sm" variant="outline" onClick={() => applyPreset('all')} className="h-7 text-xs border-slate-700 bg-slate-900">
                        Select All
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => applyPreset('none')} className="h-7 text-xs border-slate-700 bg-slate-900">
                        Clear All
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => applyPreset('finance')} className="h-7 text-xs border-slate-700 bg-slate-900 text-emerald-400">
                        Donations
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => applyPreset('support')} className="h-7 text-xs border-slate-700 bg-slate-900 text-blue-400">
                        Chat & Inquiries
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => applyPreset('content')} className="h-7 text-xs border-slate-700 bg-slate-900 text-amber-400">
                        Content
                      </Button>
                    </div>
                  </div>

                  {/* Section by Section Checklist */}
                  <div className="space-y-3">
                    {permissionsBySection.map((section) => {
                      const keys = section.perms.map((p) => p.key);
                      const isEntireSectionChecked = keys.every((k) => selectedPermissions.includes(k));
                      const isPartial = keys.some((k) => selectedPermissions.includes(k)) && !isEntireSectionChecked;

                      return (
                        <div key={section.id} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleSection(section.perms)}
                              className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-orange-400 transition-colors"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors ${
                                isEntireSectionChecked
                                  ? 'bg-orange-600 border-orange-500 text-white'
                                  : isPartial
                                  ? 'bg-orange-600/40 border-orange-500 text-white'
                                  : 'border-slate-700 bg-slate-900'
                              }`}>
                                {isEntireSectionChecked && <Check className="w-3 h-3" />}
                                {isPartial && <span className="text-[10px] leading-none">-</span>}
                              </div>
                              <span>{section.name}</span>
                            </button>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {keys.filter((k) => selectedPermissions.includes(k)).length} / {keys.length} actions
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6 pt-1">
                            {section.perms.map((p) => {
                              const checked = selectedPermissions.includes(p.key);
                              return (
                                <label
                                  key={p.key}
                                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                    checked 
                                      ? 'bg-orange-600/10 border-orange-500/40 text-orange-300 font-medium' 
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePermission(p.key)}
                                    className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900"
                                  />
                                  <span className="truncate">{p.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <DialogFooter className="border-t border-slate-800 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md"
                >
                  {createMutation.isPending ? 'Creating Staff...' : 'Save & Create Account'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* EDIT PERMISSIONS MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-500" />
                Edit Staff: {selectedStaff?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Update account details and modify section/action authorization in real time.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Full Name</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Email Address</Label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Phone</Label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="bg-slate-900 border-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <Label className="text-xs font-semibold text-slate-300">Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setFormRole('admin')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formRole === 'admin' 
                        ? 'bg-purple-600/15 border-purple-500 text-white font-semibold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formRole === 'admin' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'}`}>
                        {formRole === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      Staff Admin (Restricted)
                    </div>
                  </div>

                  <div 
                    onClick={() => setFormRole('super_admin')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formRole === 'super_admin' 
                        ? 'bg-orange-600/15 border-orange-500 text-white font-semibold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formRole === 'super_admin' ? 'border-orange-400 bg-orange-500' : 'border-slate-600'}`}>
                        {formRole === 'super_admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      Super Admin (Wildcard *)
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions Checklist */}
              {formRole === 'admin' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white">Assigned Permissions</h3>
                    <div className="flex gap-1.5">
                      <Button type="button" size="sm" variant="outline" onClick={() => applyPreset('all')} className="h-7 text-xs border-slate-700 bg-slate-900">
                        All
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => applyPreset('none')} className="h-7 text-xs border-slate-700 bg-slate-900">
                        None
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {permissionsBySection.map((section) => {
                      const keys = section.perms.map((p) => p.key);
                      const isEntireSectionChecked = keys.every((k) => selectedPermissions.includes(k));
                      const isPartial = keys.some((k) => selectedPermissions.includes(k)) && !isEntireSectionChecked;

                      return (
                        <div key={section.id} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleSection(section.perms)}
                              className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-orange-400 transition-colors"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                                isEntireSectionChecked
                                  ? 'bg-orange-600 border-orange-500 text-white'
                                  : isPartial
                                  ? 'bg-orange-600/40 border-orange-500 text-white'
                                  : 'border-slate-700 bg-slate-900'
                              }`}>
                                {isEntireSectionChecked && <Check className="w-3 h-3" />}
                                {isPartial && <span className="text-[10px] leading-none">-</span>}
                              </div>
                              <span>{section.name}</span>
                            </button>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {keys.filter((k) => selectedPermissions.includes(k)).length} / {keys.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6 pt-1">
                            {section.perms.map((p) => {
                              const checked = selectedPermissions.includes(p.key);
                              return (
                                <label
                                  key={p.key}
                                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                    checked 
                                      ? 'bg-orange-600/10 border-orange-500/40 text-orange-300 font-medium' 
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePermission(p.key)}
                                    className="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900"
                                  />
                                  <span className="truncate">{p.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <DialogFooter className="border-t border-slate-800 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* RESET PASSWORD MODAL */}
        {/* ========================================================================= */}
        <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
          <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-500" />
                Reset Password: {selectedStaff?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Set a new secure password for <span className="font-semibold text-slate-200">@{selectedStaff?.username}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">New Password</Label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-sm"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                <span>The new password will be immediately hashed with bcrypt and updated on the server.</span>
              </div>

              <DialogFooter className="border-t border-slate-800 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsResetPasswordOpen(false)} className="border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={resetPasswordMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                  {resetPasswordMutation.isPending ? 'Updating...' : 'Confirm Password Reset'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
