import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import useAuth from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Images, 
  Calendar, 
  Film, 
  Tv,
  DollarSign, 
  Target, 
  Quote, 
  FileText,
  Users, 
  Mail, 
  MessageSquare,
  MessageCircle,
  Share,
  Home,
  Menu,
  X,
  ShieldCheck,
  History,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MenuItem {
  href: string;
  icon: any;
  label: string;
  permission?: string;
  superAdminOnly?: boolean;
  tourId?: string;
}

const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isSuperAdmin, hasPermission, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const allMenuItems: MenuItem[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard.view', tourId: 'dashboard-nav' },
    { href: '/admin/chat', icon: MessageCircle, label: 'Live Chat', permission: 'chat.view', tourId: 'chat-nav' },
    { href: '/admin/donations', icon: DollarSign, label: 'Donations', permission: 'donations.view', tourId: 'donations-nav' },
    { href: '/admin/donation-categories', icon: Target, label: 'Categories', permission: 'categories.view', tourId: 'categories-nav' },
    { href: '/admin/events', icon: Calendar, label: 'Events & Festivals', permission: 'events.view', tourId: 'events-nav' },
    { href: '/admin/banners', icon: Images, label: 'Hero Banners', permission: 'banners.view', tourId: 'content-nav' },
    { href: '/admin/gallery', icon: Images, label: 'Temple Gallery', permission: 'gallery.view', tourId: 'content-nav' },
    { href: '/admin/videos', icon: Film, label: 'Video Library', permission: 'videos.view', tourId: 'content-nav' },
    { href: '/admin/live-videos', icon: Tv, label: 'Live Streams', permission: 'live_videos.view', tourId: 'content-nav' },
    { href: '/admin/quotes', icon: Quote, label: 'Daily Quotes', permission: 'quotes.view', tourId: 'content-nav' },
    { href: '/admin/blog', icon: FileText, label: 'Blog Posts', permission: 'blog.view', tourId: 'content-nav' },
    { href: '/admin/users', icon: Users, label: 'Devotees & Users', permission: 'users.view', tourId: 'users-nav' },
    { href: '/admin/messages', icon: Mail, label: 'Inquiries', permission: 'messages.view', tourId: 'content-nav' },
    { href: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials', permission: 'testimonials.view', tourId: 'content-nav' },
    { href: '/admin/social-links', icon: Share, label: 'Social & Settings', permission: 'social_links.view', tourId: 'content-nav' },
    { href: '/admin/staff', icon: ShieldCheck, label: 'Staff Management', superAdminOnly: true, tourId: 'staff-nav' },
    { href: '/admin/audit-logs', icon: History, label: 'Security Audit Logs', permission: 'audit_logs.view', tourId: 'audit-nav' },
  ];

  // Strictly filter menu items based on authenticated user's permissions
  const authorizedMenuItems = allMenuItems.filter((item) => {
    if (item.superAdminOnly) {
      return isSuperAdmin;
    }
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    setLocation('/admin/login');
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <h1 className="text-white font-bold text-lg tracking-tight">ISKCON Admin</h1>
            {isSuperAdmin ? (
              <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] uppercase font-bold">
                Super Admin
              </Badge>
            ) : (
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold">
                Staff
              </Badge>
            )}
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
          onClick={closeMobileMenu} 
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed top-16 left-0 bottom-0 w-80 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {authorizedMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-orange-600/15 text-orange-400 border-l-4 border-orange-500 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={closeMobileMenu}
                    data-tour={item.tourId}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-400 font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                <Home className="w-3.5 h-3.5 mr-1.5" /> Website
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              size="sm" 
              className="bg-red-600/80 hover:bg-red-600 text-xs"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 w-64 bg-slate-900 border-r border-slate-800 h-screen flex-shrink-0 hidden md:flex flex-col z-30 shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-md">
              I
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">ISKCON Juhu</h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Admin Portal</p>
            </div>
          </Link>
        </div>

        {/* Role Pill */}
        <div className="px-4 pt-3 pb-1">
          <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{user?.name || user?.username}</span>
            </div>
            {isSuperAdmin ? (
              <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] uppercase font-extrabold px-1.5 py-0.5">
                Super Admin
              </Badge>
            ) : (
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] uppercase font-extrabold px-1.5 py-0.5">
                Staff
              </Badge>
            )}
          </div>
        </div>
        
        <nav className="p-3 flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <ul className="space-y-1">
            {authorizedMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                      active
                        ? 'bg-orange-600 text-white font-medium shadow-md shadow-orange-600/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    data-tour={item.tourId}
                  >
                    <Icon className={`mr-3 h-4 w-4 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 text-xs">
              <Home className="mr-2 h-3.5 w-3.5" /> Back to Website
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;