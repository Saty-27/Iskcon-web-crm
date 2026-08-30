import SEO from '@/components/seo/SEO';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import StatsSection from '@/components/home/StatsSection';
import TempleSchedule from '@/components/home/TempleSchedule';
import QuoteRotator from '@/components/home/QuoteRotator';
import DonationCategories from '@/components/home/DonationCategories';
import CurrentEvents from '@/components/home/CurrentEvents';
import MediaHighlights from '@/components/home/MediaHighlights';
import Testimonials from '@/components/home/Testimonials';
import ContactSection from '@/components/home/ContactSection';
import WatchLiveButton from '@/components/WatchLiveButton';

const Home = () => {
  return (
    <>
      <SEO 
        title="ISKCON Juhu - Sri Sri Radha Rasabihari Temple | Mumbai Official Portal"
        description="Welcome to ISKCON Juhu (Sri Sri Radha Rasabihari Temple), Hare Krishna Land, Mumbai. Experience daily live darshan, aartis, Anna Daan, Bhagavad Gita discourses, and online 80G tax-exempt donations."
        keywords="ISKCON Juhu, ISKCON Mumbai, Sri Sri Radha Rasabihari, Hare Krishna, Hare Krishna Mahamantra, Srila Prabhupada, Daan Seva, Anna Daan, Gau Seva, Bhagavad Gita, Temple donation 80G, Janmashtami Mumbai, Darshan Timings, Juhu Temple Aarti"
        schemaType="temple"
      />
      
      <Header />
      
      <main>
        <HeroSlider />
        <section className="temple-info-section">
          <TempleSchedule />
          <StatsSection />
        </section>
        <QuoteRotator />
        <DonationCategories />
        <CurrentEvents />
        <MediaHighlights />
        <Testimonials />
        <ContactSection />
      </main>
      
      <Footer />
      <WatchLiveButton />
    </>
  );
};

export default Home;
