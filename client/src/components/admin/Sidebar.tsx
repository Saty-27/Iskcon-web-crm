import { useState } from 'react';
import { Link, useLocation } from 'wouter';
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
  Share,
  Home,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMobileMenu = () => {
    console.log('Toggle mobile menu clicked, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    console.log('Close mobile menu');
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', tourId: 'dashboard-nav' },
    { href: '/admin/banners', icon: Images, label: 'Banners', tourId: 'content-nav' },
    { href: '/admin/events', icon: Calendar, label: 'Events', tourId: 'events-nav' },
    { href: '/admin/gallery', icon: Images, label: 'Gallery', tourId: 'content-nav' },
    { href: '/admin/videos', icon: Film, label: 'Videos', tourId: 'content-nav' },
    { href: '/admin/live-videos', icon: Tv, label: 'Live Videos', tourId: 'content-nav' },
    { href: '/admin/donations', icon: DollarSign, label: 'Donations', tourId: 'donations-nav' },
    { href: '/admin/donation-categories', icon: Target, label: 'Donation Categories', tourId: 'categories-nav' },
    { href: '/admin/quotes', icon: Quote, label: 'Quotes', tourId: 'content-nav' },
    { href: '/admin/blog', icon: FileText, label: 'Blog Management', tourId: 'content-nav' },
    { href: '/admin/users', icon: Users, label: 'Users', tourId: 'users-nav' },
    { href: '/admin/messages', icon: Mail, label: 'Messages', tourId: 'content-nav' },
    { href: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials', tourId: 'content-nav' },
    { href: '/admin/social-links', icon: Share, label: 'Social Links', tourId: 'content-nav' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-gray-900 font-bold text-xl">ISKCON Admin</h1>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" 
          onClick={closeMobileMenu} 
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`md:hidden fixed top-16 left-0 bottom-0 w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4 h-full overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg text-gray-700 transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={closeMobileMenu}
                    data-tour={item.tourId}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <Link 
              href="/"
              className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-all duration-200"
              onClick={closeMobileMenu}
            >
              <Home className="mr-3 h-5 w-5" />
              <span className="font-medium">Back to Website</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 w-64 bg-white border-r border-gray-200 h-screen flex-shrink-0 hidden md:flex flex-col z-30">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center">
            <h1 className="text-gray-900 font-bold text-xl">ISKCON Admin</h1>
          </Link>
        </div>
        
        <nav className="p-4 flex-col gap-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg text-gray-700 transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600'
                        : 'hover:bg-gray-100'
                    }`}
                    data-tour={item.tourId}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="border-t border-gray-200 mt-4 pt-4">
            <Link 
              href="/"
              className="flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-all duration-200"
            >
              <Home className="mr-3 h-5 w-5" />
              <span className="font-medium">Back to Website</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;