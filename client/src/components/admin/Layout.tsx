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
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        
        {/* Content wrapper - different positioning for mobile vs desktop */}
        <div className="pt-16 md:pt-0 md:ml-64">
          {/* Desktop Header - hidden on mobile since we use mobile header from Sidebar */}
          <div className="hidden md:block bg-white border-b border-gray-200">
            <Header />
          </div>
          
          {/* Main content */}
          <main className="min-h-screen bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
};

export default Layout;
