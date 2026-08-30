import { useState } from 'react';
import { Menu, Download, User, HelpCircle, LogOut, Home, Shield, ShieldCheck } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation, Link } from 'wouter';
import useAuth from '@/hooks/useAuth';
import { useOnboarding } from '@/components/admin/OnboardingProvider';

const Header = () => {
  const [location, setLocation] = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();
  const { startTour } = useOnboarding();

  const handleLogout = async () => {
    await logout();
    setLocation('/admin/login');
  };

  const getPageTitle = () => {
    if (location === '/admin') return 'Overview Dashboard';
    if (location === '/admin/staff') return 'Staff & RBAC Permissions';
    if (location === '/admin/audit-logs') return 'Security Audit Trail';
    if (location === '/admin/donations') return 'Donations Management';
    if (location === '/admin/donation-categories') return 'Donation Categories';
    if (location === '/admin/donation-stats') return 'Donation Analytics';
    if (location === '/admin/chat') return 'Live Devotee Chat';
    if (location === '/admin/gallery') return 'Temple Gallery Management';
    if (location === '/admin/events') return 'Events & Festivals';
    if (location === '/admin/banners') return 'Hero Banners';
    if (location === '/admin/videos') return 'Video Library';
    if (location === '/admin/live-videos') return 'Live Streams';
    if (location === '/admin/quotes') return 'Daily Quotes';
    if (location === '/admin/blog') return 'Blog Articles';
    if (location === '/admin/users') return 'Devotees & Users';
    if (location === '/admin/messages') return 'Inquiries & Contact';
    if (location === '/admin/testimonials') return 'Testimonials';
    if (location === '/admin/social-links') return 'Social Media Links';
    return 'Admin Portal';
  };

  const showExportButton = location === '/admin/donations';

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between text-slate-100">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
        {isSuperAdmin ? (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] font-bold tracking-wider uppercase">
            SUPER ADMIN
          </Badge>
        ) : (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] font-bold tracking-wider uppercase">
            STAFF ADMIN
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Back to Website Button */}
        <Link href="/">
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-700 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center text-xs h-8"
            title="View Public Website"
          >
            <Home className="h-3.5 w-3.5 md:mr-1.5 text-orange-400" />
            <span className="hidden md:inline">View Website</span>
          </Button>
        </Link>

        {/* Tour Help Button */}
        <Button 
          onClick={startTour}
          variant="outline" 
          size="sm"
          className="hidden md:flex items-center border-slate-700 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs h-8"
          title="Restart Admin Tour"
        >
          <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
          Tour
        </Button>
        
        {showExportButton && (
          <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-md">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center space-x-2.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {user?.name || user?.username || 'Admin User'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  @{user?.username || 'admin'}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border border-slate-800 text-slate-200">
            <DropdownMenuLabel className="text-xs text-slate-400">Account Details</DropdownMenuLabel>
            <div className="px-2 py-1.5 text-xs">
              <div className="font-semibold text-white">{user?.name || user?.username}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email || 'No email set'}</div>
            </div>
            <DropdownMenuSeparator className="bg-slate-800" />
            {isSuperAdmin && (
              <DropdownMenuItem asChild className="text-xs hover:bg-slate-800 cursor-pointer">
                <Link href="/admin/staff" className="flex items-center w-full">
                  <ShieldCheck className="h-3.5 w-3.5 mr-2 text-orange-400" />
                  Staff Management
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="text-xs hover:bg-slate-800 cursor-pointer">
              <Link href="/admin/audit-logs" className="flex items-center w-full">
                <Shield className="h-3.5 w-3.5 mr-2 text-slate-400" />
                Audit Logs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem onClick={handleLogout} className="text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer">
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;