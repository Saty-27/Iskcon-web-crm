import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Heart, Calendar, BookOpen, Compass, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/seo/SEO";

export default function NotFound() {
  return (
    <>
      <SEO 
        title="Page Not Found | ISKCON Juhu - Sri Sri Radha Rasabihari"
        description="The page you are looking for might have been moved or doesn't exist. Return to ISKCON Juhu homepage or explore our darshan, events, and donation sevas."
      />
      <Header />
      <div className="min-h-[75vh] w-full flex items-center justify-center bg-gradient-to-b from-orange-50/40 via-white to-purple-50/30 px-4 py-16">
        <div className="max-w-xl w-full text-center bg-white border border-orange-100 shadow-xl rounded-3xl p-8 md:p-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Compass className="w-4 h-4 text-orange-600 animate-spin" style={{ animationDuration: '6s' }} />
            404 • Page Not Found
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-poppins mb-3">
            Lost on Your Spiritual Journey?
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto">
            The page you requested could not be found or the link may have been typed incorrectly. Let us guide you back to our temple portal.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all duration-200">
                <Home className="w-4 h-4 mr-2" /> Back to Homepage
              </Button>
            </Link>
            <Link href="/donate">
              <Button variant="outline" className="w-full sm:w-auto border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold px-6 py-2.5 rounded-xl">
                <Heart className="w-4 h-4 mr-2 text-orange-500" /> Daan & Seva
              </Button>
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Popular Sections</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link href="/events" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition-colors">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Festivals & Events
              </Link>
              <Link href="/gallery" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition-colors">
                <Compass className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Darshan Gallery
              </Link>
              <Link href="/blog" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition-colors">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-orange-500" /> Spiritual Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

