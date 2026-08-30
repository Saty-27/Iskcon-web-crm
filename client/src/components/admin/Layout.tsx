import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { OnboardingProvider } from './OnboardingProvider';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-slate-950 selection:bg-orange-500/30 selection:text-orange-200">
        <Sidebar />
        
        {/* Content wrapper */}
        <div className="pt-16 md:pt-0 md:ml-64 flex flex-col min-h-screen bg-slate-950">
          {/* Desktop Header */}
          <div className="hidden md:block sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 shadow-sm text-slate-100">
            <Header />
          </div>
          
          {/* Main content */}
          <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
};

export default Layout;
