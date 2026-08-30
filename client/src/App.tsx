import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Critical landing and donation entry routes (loaded eagerly for instant LCP)
import Home from "@/pages/Home";
import Donate from "@/pages/Donate";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailure from "@/pages/PaymentFailure";
import NotFound from "@/pages/not-found";

// Secondary public routes (lazy loaded on demand)
const Events = lazy(() => import("@/pages/Events"));
const CategoryDonation = lazy(() => import("@/pages/CategoryDonation"));
const EventDonation = lazy(() => import("@/pages/EventDonation"));
const DonateThankYou = lazy(() => import("@/pages/donate/ThankYou"));
const PaymentGateway = lazy(() => import("@/pages/donate/PaymentGateway"));
const PaymentFailed = lazy(() => import("@/pages/donate/PaymentFailed"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Videos = lazy(() => import("@/pages/Videos"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Contact = lazy(() => import("@/pages/Contact"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminRoute = lazy(() => import("@/components/auth/AdminRoute"));

// Admin pages (lazy loaded on demand)
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminBanners = lazy(() => import("@/pages/admin/Banners"));
const AdminEventManagement = lazy(() => import("@/pages/admin/EventManagement"));
const EventsAdmin = lazy(() => import("@/pages/admin/EventsAdmin"));
const AdminGallery = lazy(() => import("@/pages/admin/Gallery"));
const AdminVideos = lazy(() => import("@/pages/admin/Videos"));
const AdminLiveVideos = lazy(() => import("@/pages/admin/LiveVideos"));
const AdminDonations = lazy(() => import("@/pages/admin/Donations"));
const AdminDonationCategories = lazy(() => import("@/pages/admin/DonationCategories"));
const AdminDonationStats = lazy(() => import("@/pages/admin/DonationStats"));
const AdminQuotes = lazy(() => import("@/pages/admin/Quotes"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminMessages = lazy(() => import("@/pages/admin/Messages"));
const AdminTestimonials = lazy(() => import("@/pages/admin/Testimonials"));
const AdminSocialLinks = lazy(() => import("@/pages/admin/SocialLinks"));
const BlogManagement = lazy(() => import("@/pages/admin/BlogManagement"));
const AdminChat = lazy(() => import("@/pages/admin/Chat"));
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const StaffManagement = lazy(() => import("@/pages/admin/StaffManagement"));
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const ChatWidget = lazy(() => import("@/components/chat/ChatWidget"));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Main core routes */}
        <Route path="/" component={Home} />
        <Route path="/events" component={Events} />

        <Route path="/donate" component={Donate} />
        <Route path="/donate/thank-you" component={DonateThankYou} />
        <Route path="/donate/payment-gateway" component={PaymentGateway} />
        <Route path="/donate/payment-failed" component={PaymentFailed} />
        <Route path="/donate/event/:eventId" component={EventDonation} />
        <Route path="/donate/category/:categoryId" component={CategoryDonation} />
        <Route path="/donate/:categoryId" component={CategoryDonation} />
        
        {/* Payment result pages */}
        <Route path="/payment/success" component={PaymentSuccess} />
        <Route path="/payment/failure" component={PaymentFailure} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/videos" component={Videos} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/contact" component={Contact} />
        
        {/* Authentication routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/profile" component={Profile} />
        
        {/* Admin Login Route (Publicly accessible for administrators) */}
        <Route path="/admin/login" component={AdminLogin} />
        
        {/* Admin routes - strictly protected with backend & frontend RBAC AdminRoute */}
        <Route path="/admin">
          {() => (
            <AdminRoute requiredPermission="dashboard.view">
              <AdminDashboard />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/banners">
          {() => (
            <AdminRoute requiredPermission="banners.view">
              <AdminBanners />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/events">
          {() => (
            <AdminRoute requiredPermission="events.view">
              <EventsAdmin />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/events/:id">
          {() => (
            <AdminRoute requiredPermission="events.view">
              <AdminEventManagement />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/gallery">
          {() => (
            <AdminRoute requiredPermission="gallery.view">
              <AdminGallery />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/videos">
          {() => (
            <AdminRoute requiredPermission="videos.view">
              <AdminVideos />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/live-videos">
          {() => (
            <AdminRoute requiredPermission="live_videos.view">
              <AdminLiveVideos />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/donations">
          {() => (
            <AdminRoute requiredPermission="donations.view">
              <AdminDonations />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/donation-categories">
          {() => (
            <AdminRoute requiredPermission="categories.view">
              <AdminDonationCategories />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/donation-stats">
          {() => (
            <AdminRoute requiredPermission="donations.view">
              <AdminDonationStats />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/quotes">
          {() => (
            <AdminRoute requiredPermission="quotes.view">
              <AdminQuotes />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/users">
          {() => (
            <AdminRoute requiredPermission="users.view">
              <AdminUsers />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/messages">
          {() => (
            <AdminRoute requiredPermission="messages.view">
              <AdminMessages />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/testimonials">
          {() => (
            <AdminRoute requiredPermission="testimonials.view">
              <AdminTestimonials />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/social-links">
          {() => (
            <AdminRoute requiredPermission="social_links.view">
              <AdminSocialLinks />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/blog">
          {() => (
            <AdminRoute requiredPermission="blog.view">
              <BlogManagement />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/chat">
          {() => (
            <AdminRoute requiredPermission="chat.view">
              <AdminChat />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/staff">
          {() => (
            <AdminRoute requiredSuperAdmin={true}>
              <StaffManagement />
            </AdminRoute>
          )}
        </Route>
        <Route path="/admin/audit-logs">
          {() => (
            <AdminRoute requiredPermission="audit_logs.view">
              <AuditLogs />
            </AdminRoute>
          )}
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;