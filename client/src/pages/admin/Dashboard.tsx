import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/admin/Layout';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  CheckCircle,
  Clock,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import OnboardingTour from '@/components/admin/OnboardingTour';
import { useOnboarding } from '@/components/admin/OnboardingProvider';

const AdminDashboard = () => {
  const { shouldShowTour, completeTour, skipTour } = useOnboarding();

  // Fetch real donation data from API
  const { data: donations = [] } = useQuery({ 
    queryKey: ['/api/admin/donations'],
    retry: false,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
  });

  // Calculate real donation statistics
  const completedDonations = donations.filter(d => d.status === 'completed');
  const pendingDonations = donations.filter(d => d.status === 'pending');
  const failedDonations = donations.filter(d => d.status === 'failed');
  const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Layout>
      {shouldShowTour && (
        <OnboardingTour 
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
      <Helmet>
        <title>Admin Dashboard - ISKCON Juhu</title>
      </Helmet>
      
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor and manage your temple's digital presence</p>
          </div>

          {/* Real-time Donation Statistics Grid - Modern Gradient Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="dashboard-stats">
            {/* Total Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold mb-2">{donations.length}</div>
                <p className="text-purple-100 text-sm">Total Donations</p>
              </div>
            </div>

            {/* Completed Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Success</span>
                </div>
                <div className="text-4xl font-bold mb-2">{completedDonations.length}</div>
                <p className="text-emerald-100 text-sm">Completed</p>
              </div>
            </div>

            {/* Pending Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Waiting</span>
                </div>
                <div className="text-4xl font-bold mb-2">{pendingDonations.length}</div>
                <p className="text-orange-100 text-sm">Pending</p>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <IndianRupee className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Revenue</span>
                </div>
                <div className="text-4xl font-bold mb-2">₹{totalAmount.toLocaleString()}</div>
                <p className="text-blue-100 text-sm">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Recent Donations Table */}
          <Card className="rounded-xl shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
                <a href="/admin/donations" className="text-purple-600 hover:text-purple-700 font-medium">
                  View All →
                </a>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Donor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.slice(0, 5).map((donation) => (
                      <tr key={donation.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">#{donation.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{donation.name}</div>
                            <div className="text-sm text-gray-500">{donation.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">₹{donation.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            donation.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {donation.status === 'completed' ? 'Completed' : 
                             donation.status === 'pending' ? 'Pending' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {donations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                          No donations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;