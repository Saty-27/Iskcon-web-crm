import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Info,
  Target,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  Calendar
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ISKCON Juhu Admin Dashboard',
      description: 'This tour will guide you through the key features of your admin dashboard. Let\'s get started!',
      target: '',
      icon: <Info className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      description: 'Your dashboard provides real-time insights into donations, user activity, and temple statistics. Monitor your key metrics at a glance.',
      target: '[data-tour="dashboard-stats"]',
      icon: <BarChart3 className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'donations-management',
      title: 'Donations Management',
      description: 'Track all donations, view donor details, and monitor payment statuses. This is where you can see completed, pending, and failed transactions.',
      target: '[data-tour="donations-nav"]',
      icon: <CreditCard className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'donation-categories',
      title: 'Donation Categories',
      description: 'Create and manage donation categories like Temple Renovation, Food for All, etc. Each category can have its own bank details and QR codes.',
      target: '[data-tour="categories-nav"]',
      icon: <Target className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'events-management',
      title: 'Events & Festivals',
      description: 'Manage temple events and festivals. Create special donation campaigns for festivals like Janmashtami.',
      target: '[data-tour="events-nav"]',
      icon: <Calendar className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage admin users and view donor information. Control who has access to the admin panel.',
      target: '[data-tour="users-nav"]',
      icon: <Users className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'content-management',
      title: 'Content Management',
      description: 'Update website content including banners, blog posts, quotes, and gallery images to keep your website fresh.',
      target: '[data-tour="content-nav"]',
      icon: <Settings className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Congratulations! You now know the basics of managing your ISKCON Juhu donation system. Start by creating your first donation category or event.',
      target: '',
      icon: <CheckCircle className="w-5 h-5" />,
      position: 'bottom',
      action: {
        text: 'Create First Category',
        onClick: () => {
          window.location.href = '/admin/donation-categories';
        }
      }
    }
  ];

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (currentTourStep.target) {
      const element = document.querySelector(currentTourStep.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class
        element.classList.add('tour-highlight');
      }
    } else {
      setHighlightedElement(null);
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, currentTourStep.target]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
    }
    onComplete();
  };

  const skipTour = () => {
    setIsVisible(false);
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
    }
    onSkip();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 pointer-events-none" />
      
      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto shadow-2xl border-2 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {currentTourStep.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-gray-600 mb-6 leading-relaxed">
              {currentTourStep.description}
            </p>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === tourSteps.length - 1 ? (
                <div className="flex-1 space-y-2">
                  {currentTourStep.action && (
                    <Button
                      onClick={currentTourStep.action.onClick}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {currentTourStep.action.text}
                    </Button>
                  )}
                  <Button
                    onClick={completeTour}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Tour
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex-1"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
            
            {/* Skip Option */}
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTour}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OnboardingTour;