import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Events from "@/pages/Events";

import Donate from "@/pages/Donate";
import CategoryDonation from "@/pages/CategoryDonation";
import EventDonation from "@/pages/EventDonation";

import DonateThankYou from "@/pages/donate/ThankYou";
import PaymentGateway from "@/pages/donate/PaymentGateway";
import PaymentFailed from "@/pages/donate/PaymentFailed";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailure from "@/pages/PaymentFailure";
import Gallery from "@/pages/Gallery";
import Videos from "@/pages/Videos";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import AdminRoute from "@/components/auth/AdminRoute";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminBanners from "@/pages/admin/Banners";
import AdminEvents from "@/pages/admin/Events";
import AdminEventManagement from "@/pages/admin/EventManagement";
import EventsAdmin from "@/pages/admin/EventsAdmin";
import AdminGallery from "@/pages/admin/Gallery";
import AdminVideos from "@/pages/admin/Videos";
import AdminLiveVideos from "@/pages/admin/LiveVideos";
import AdminDonations from "@/pages/admin/Donations";
import AdminDonationCategories from "@/pages/admin/DonationCategories";
import AdminDonationStats from "@/pages/admin/DonationStats";
import AdminQuotes from "@/pages/admin/Quotes";
import AdminUsers from "@/pages/admin/Users";
import AdminMessages from "@/pages/admin/Messages";
import AdminTestimonials from "@/pages/admin/Testimonials";
import AdminSocialLinks from "@/pages/admin/SocialLinks";
import BlogManagement from "@/pages/admin/BlogManagement";

function Router() {
  return (
    <Switch>
      {/* Main routes */}
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
      
      {/* Admin routes - protected with AdminRoute */}
      <Route path="/admin">
        {() => (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/banners">
        {() => (
          <AdminRoute>
            <AdminBanners />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/events">
        {() => (
          <AdminRoute>
            <EventsAdmin />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/events/:id">
        {() => (
          <AdminRoute>
            <AdminEventManagement />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/gallery">
        {() => (
          <AdminRoute>
            <AdminGallery />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/videos">
        {() => (
          <AdminRoute>
            <AdminVideos />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/live-videos">
        {() => (
          <AdminRoute>
            <AdminLiveVideos />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/donations">
        {() => (
          <AdminRoute>
            <AdminDonations />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/donation-categories">
        {() => (
          <AdminRoute>
            <AdminDonationCategories />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/donation-stats">
        {() => (
          <AdminRoute>
            <AdminDonationStats />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/quotes">
        {() => (
          <AdminRoute>
            <AdminQuotes />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/messages">
        {() => (
          <AdminRoute>
            <AdminMessages />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/testimonials">
        {() => (
          <AdminRoute>
            <AdminTestimonials />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/social-links">
        {() => (
          <AdminRoute>
            <AdminSocialLinks />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/blog">
        {() => (
          <AdminRoute>
            <BlogManagement />
          </AdminRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;