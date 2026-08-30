import { ReactNode, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import useAuth from '@/hooks/useAuth';
import { Loader2, ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredSuperAdmin?: boolean;
}

const AdminRoute = ({ children, requiredPermission, requiredSuperAdmin = false }: AdminRouteProps) => {
  const { isAuthenticated, user, isLoading, hasPermission, isSuperAdmin, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const token = localStorage.getItem('authToken');
        // Only redirect if there is definitively no token in storage
        if (!token) {
          setLocation('/admin/login');
        }
      } else if (!isAdmin) {
        setLocation('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, location, setLocation]);

  if (isLoading || (!isAuthenticated && typeof window !== 'undefined' && localStorage.getItem('authToken'))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
          <p className="text-sm font-medium text-slate-400">Verifying security permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Super Admin check
  if (requiredSuperAdmin && !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">403 - Super Admin Access Required</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              This management portal is restricted exclusively to primary Super Administrators. Your current role is <span className="font-semibold text-orange-400">{user?.role?.toUpperCase()}</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link href="/admin/dashboard">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium">
                <Home className="w-4 h-4 mr-2" /> Go to Admin Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Website
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Specific Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">403 - Permission Denied</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              You do not have the required permission (<code className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 text-xs font-mono">{requiredPermission}</code>) to access this administrative section.
            </p>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl text-left text-xs text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold mb-1">Account Permissions:</div>
            {user?.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {user.permissions.map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="italic text-slate-500">No specific section permissions assigned. Contact your Super Admin.</p>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link href="/admin/dashboard">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium">
                <Home className="w-4 h-4 mr-2" /> Go to Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Website
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;