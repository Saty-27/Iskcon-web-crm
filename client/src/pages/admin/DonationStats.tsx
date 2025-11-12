import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Donation } from '@shared/schema';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Helper functions for date operations
const getStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getEndOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const getStartOfWeek = (date: Date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  newDate.setDate(diff);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getEndOfWeek = (date: Date) => {
  const newDate = getStartOfWeek(date);
  newDate.setDate(newDate.getDate() + 6);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const getStartOfMonth = (date: Date) => {
  const newDate = new Date(date);
  newDate.setDate(1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getEndOfMonth = (date: Date) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(0);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const getStartOfYear = (date: Date) => {
  const newDate = new Date(date);
  newDate.setMonth(0, 1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getEndOfYear = (date: Date) => {
  const newDate = new Date(date);
  newDate.setMonth(11, 31);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

const DonationStats = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'custom' | 'all'>('month');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date()
  });
  
  // Calculate date range based on selection
  const getDateRangeParams = () => {
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return {
          startDate: getStartOfDay(now).toISOString(),
          endDate: getEndOfDay(now).toISOString()
        };
      case 'week':
        return {
          startDate: getStartOfWeek(now).toISOString(),
          endDate: getEndOfWeek(now).toISOString()
        };
      case 'month':
        return {
          startDate: getStartOfMonth(now).toISOString(),
          endDate: getEndOfMonth(now).toISOString()
        };
      case 'year':
        return {
          startDate: getStartOfYear(now).toISOString(),
          endDate: getEndOfYear(now).toISOString()
        };
      case 'custom':
        return {
          startDate: getStartOfDay(customRange.from).toISOString(),
          endDate: getEndOfDay(customRange.to).toISOString()
        };
      case 'all':
      default:
        return {};
    }
  };
  
  // Fetch donations based on date range
  const { data: donations = [], isLoading } = useQuery<Donation[]>({
    queryKey: ['/api/donations', dateRange, customRange],
    queryFn: async () => {
      const params = getDateRangeParams();
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const response = await fetch(`/api/donations${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch donations');
      return response.json();
    }
  });
  
  // Calculate statistics
  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const successfulDonations = donations.filter(d => d.status === 'completed');
  const successfulAmount = successfulDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const averageDonation = successfulDonations.length > 0 ? successfulAmount / successfulDonations.length : 0;
  
  // Prepare data for charts
  const prepareCategoryData = () => {
    const categoryMap = new Map<string, number>();
    
    successfulDonations.forEach(donation => {
      if (donation.categoryId) {
        const categoryName = donation.categoryName || `Category ${donation.categoryId}`;
        categoryMap.set(
          categoryName,
          (categoryMap.get(categoryName) || 0) + donation.amount
        );
      } else {
        categoryMap.set('General', (categoryMap.get('General') || 0) + donation.amount);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  };
  
  const prepareDailyData = () => {
    const dailyMap = new Map<string, number>();
    const days = [];
    
    // Determine date range based on selected filter
    let startDate, endDate;
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate = getStartOfDay(now);
        endDate = getEndOfDay(now);
        break;
      case 'week':
        startDate = getStartOfWeek(now);
        endDate = getEndOfWeek(now);
        break;
      case 'month':
        startDate = getStartOfMonth(now);
        endDate = getEndOfMonth(now);
        break;
      case 'year':
        startDate = getStartOfYear(now);
        endDate = getEndOfYear(now);
        break;
      case 'custom':
        startDate = getStartOfDay(customRange.from);
        endDate = getEndOfDay(customRange.to);
        break;
      default:
        startDate = new Date(Math.min(...donations.map(d => new Date(d.createdAt).getTime())));
        endDate = new Date(Math.max(...donations.map(d => new Date(d.createdAt).getTime())));
    }
    
    // Create array of dates in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      days.push(dateStr);
      dailyMap.set(dateStr, 0);
    }
    
    // Sum up donation amounts by day
    successfulDonations.forEach(donation => {
      const donationDate = new Date(donation.createdAt).toISOString().split('T')[0];
      if (dailyMap.has(donationDate)) {
        dailyMap.set(donationDate, (dailyMap.get(donationDate) || 0) + donation.amount);
      }
    });
    
    return days.map(day => ({
      date: day,
      amount: dailyMap.get(day) || 0
    }));
  };
  
  const categoryData = prepareCategoryData();
  const dailyData = prepareDailyData();
  
  return (
    <>
      <Helmet>
        <title>Donation Statistics - ISKCON Juhu Admin</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-poppins font-bold mb-6">Donation Statistics</h1>
        
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="w-full md:w-64">
            <Select
              value={dateRange}
              onValueChange={(value: any) => setDateRange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Calendar
                mode="single"
                selected={customRange.from}
                onSelect={(date) => date && setCustomRange(prev => ({ ...prev, from: date }))}
                className="border rounded-md p-2"
              />
              <span>to</span>
              <Calendar
                mode="single"
                selected={customRange.to}
                onSelect={(date) => date && setCustomRange(prev => ({ ...prev, to: date }))}
                className="border rounded-md p-2"
              />
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Donation Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successfulDonations.length}</div>
                <p className="text-xs text-gray-500">
                  out of {donations.length} ({Math.round(successfulDonations.length / donations.length * 100) || 0}%)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Math.round(averageDonation).toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(successfulAmount / totalAmount * 100) || 0}%
                </div>
                <p className="text-xs text-gray-500">
                  ₹{successfulAmount.toLocaleString('en-IN')} of ₹{totalAmount.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily Trends</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="table">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Daily Donation Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="category">
            <Card>
              <CardHeader>
                <CardTitle>Donations by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-neutral border-b">
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Category</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-4 py-2"><Skeleton className="h-5 w-20" /></td>
                            <td className="px-4 py-2"><Skeleton className="h-5 w-32" /></td>
                            <td className="px-4 py-2"><Skeleton className="h-5 w-16" /></td>
                            <td className="px-4 py-2"><Skeleton className="h-5 w-24" /></td>
                            <td className="px-4 py-2"><Skeleton className="h-5 w-20" /></td>
                          </tr>
                        ))
                      ) : (
                        donations.slice(0, 10).map((donation) => (
                          <tr key={donation.id} className="border-b hover:bg-neutral">
                            <td className="px-4 py-2">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">{donation.name}</td>
                            <td className="px-4 py-2">₹{donation.amount.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2">
                              {donation.categoryName || (donation.categoryId ? `Category ${donation.categoryId}` : 'General')}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {donation.status === 'completed' ? 'Completed' : 
                                 donation.status === 'pending' ? 'Pending' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </>
  );
};

export default DonationStats;