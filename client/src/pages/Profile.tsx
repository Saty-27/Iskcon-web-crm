import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import useAuth from '@/hooks/useAuth';
import { Donation, User } from '@shared/schema';
import { Loader2, LogOut } from 'lucide-react';

const Profile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch user donations - with better error handling
  const { data: donations = [], isLoading: isLoadingDonations, error: donationsError } = useQuery<Donation[]>({
    queryKey: ['/api/user/donations'],
    enabled: isAuthenticated && !!user,
    retry: false,
    onError: (error) => {
      console.log('Donations fetch error:', error);
      // If we get a 401 error, redirect to login
      if (error instanceof Error && error.message.includes('401')) {
        setLocation('/login');
      }
    }
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation('/login');
    }
  }, [isAuthenticated, user, setLocation]);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await apiRequest('/api/auth/logout', 'POST', {});
      
      // Clear user data from cache
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      logout();
      
      toast({
        title: "Logged Out",
        description: "You have successfully logged out.",
        variant: "success",
      });
      
      // Redirect to home page
      setLocation('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  if (!isAuthenticated || !user) {
    return (
      <>
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary mb-4" />
            <p>Checking authentication status...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>My Profile - ISKCON Juhu</title>
        <meta name="description" content="View and manage your ISKCON Juhu profile, donation history, and account settings." />
        <meta property="og:title" content="My Profile - ISKCON Juhu" />
        <meta property="og:description" content="View and manage your ISKCON Juhu profile and donation history." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main className="py-16 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-poppins font-bold text-3xl md:text-4xl text-primary">
              My Profile
            </h1>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList>
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="donations">Donation History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-poppins text-primary">Personal Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-lg">{user.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Username</h3>
                      <p className="mt-1 text-lg">{user.username}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                      <p className="mt-1 text-lg">{user.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                      <p className="mt-1 text-lg">{user.phone || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="donations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-poppins text-primary">Donation History</CardTitle>
                  <CardDescription>Record of your contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDonations ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-5 w-1/5" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-1/5" />
                              <Skeleton className="h-5 w-1/6" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : donations.length === 0 ? (
                    <div className="text-center py-10">
                      <h3 className="font-poppins font-semibold text-xl text-gray-500 mb-2">No Donations Found</h3>
                      <p className="font-opensans text-gray-500 mb-4">
                        You haven't made any donations yet.
                      </p>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => setLocation('/donate')}
                      >
                        Make a Donation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {donations.map((donation) => (
                        <div key={donation.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-poppins font-semibold text-lg">
                              {donation.categoryId ? "Category Donation" : "Event Donation"}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              donation.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : donation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {format(new Date(donation.createdAt), 'MMMM d, yyyy')}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-600">{donation.message || "No message"}</span>
                            <span className="font-poppins font-semibold text-lg">
                              ₹{donation.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setLocation('/donate')}
                  >
                    Make a New Donation
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Profile;
