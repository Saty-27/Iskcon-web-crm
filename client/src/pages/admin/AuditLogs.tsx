import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/admin/Layout';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  User, 
  Activity, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AuditLogEntry {
  id: number;
  userId: number | null;
  userName: string | null;
  userRole: string | null;
  action: string;
  section: string;
  targetId: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogs() {
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const limit = 40;

  const { data, isLoading, refetch, isRefetching } = useQuery<{
    logs: AuditLogEntry[];
    total: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ['/api/admin/audit-logs', page, sectionFilter],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(page * limit),
      });
      if (sectionFilter !== 'all') {
        params.append('section', sectionFilter);
      }

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load audit logs');
      return res.json();
    },
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.section.toLowerCase().includes(q) ||
      log.targetId?.toLowerCase().includes(q) ||
      log.ipAddress?.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] uppercase">CREATE</Badge>;
      case 'update':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] uppercase">UPDATE</Badge>;
      case 'delete':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px] uppercase">DELETE</Badge>;
      case 'login':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px] uppercase">LOGIN</Badge>;
      case 'disable':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] uppercase">DISABLE</Badge>;
      case 'enable':
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] uppercase">ENABLE</Badge>;
      case 'reset_password':
        return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] uppercase">PASSWORD</Badge>;
      default:
        return <Badge className="bg-slate-700 text-slate-300 text-[10px] uppercase">{action}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-orange-500" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Security Audit Logs</h1>
            </div>
            <p className="text-sm text-slate-400">
              Complete, immutable trail of administrative operations, permission changes, logins, and data modifications.
            </p>
          </div>

          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh Trail
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search user, action, section, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Filter Section:</span>
            <select
              value={sectionFilter}
              onChange={(e) => { setSectionFilter(e.target.value); setPage(0); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Sections</option>
              <option value="auth">Authentication</option>
              <option value="staff">Staff Management</option>
              <option value="donations">Donations</option>
              <option value="gallery">Gallery</option>
              <option value="videos">Videos</option>
              <option value="banners">Banners</option>
              <option value="events">Events</option>
              <option value="chat">Live Chat</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-500" />
              <p>Loading audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Activity className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-base font-medium text-slate-400">No audit log records found</p>
              <p className="text-xs text-slate-600">Administrative activity will automatically populate here in real time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Admin User</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Section</th>
                    <th className="py-4 px-6">Target Record</th>
                    <th className="py-4 px-6">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-normal">
                  {filteredLogs.map((log) => {
                    const date = new Date(log.createdAt);
                    const formattedDate = date.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });
                    const formattedTime = date.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Timestamp */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="text-xs font-semibold text-slate-200">{formattedDate}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{formattedTime}</div>
                        </td>

                        {/* User */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-400 font-bold text-xs">
                              {log.userName ? log.userName[0].toUpperCase() : 'A'}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-xs">{log.userName || 'System'}</div>
                              <div className="text-[10px] text-slate-500 uppercase">{log.userRole || 'admin'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-6">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Section */}
                        <td className="py-4 px-6 font-mono text-xs text-orange-400">
                          {log.section}
                        </td>

                        {/* Target & Details */}
                        <td className="py-4 px-6">
                          {log.targetId ? (
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">
                              #{log.targetId}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">-</span>
                          )}
                          {log.details && (
                            <span className="ml-2 text-[11px] text-slate-400 truncate inline-block max-w-[200px]">
                              {JSON.stringify(log.details)}
                            </span>
                          )}
                        </td>

                        {/* IP Address */}
                        <td className="py-4 px-6 font-mono text-xs text-slate-400">
                          {log.ipAddress || 'Internal'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs text-slate-400">
              <div>
                Showing page <span className="text-white font-semibold">{page + 1}</span> of <span className="text-white font-semibold">{totalPages}</span> ({total} total entries)
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
