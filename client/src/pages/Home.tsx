import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import StatsSection from '@/components/home/StatsSection';
import TempleSchedule from '@/components/home/TempleSchedule';
import QuoteRotator from '@/components/home/QuoteRotator';
import DonationCategories from '@/components/home/DonationCategories';
import ProcessSection from '@/components/home/ProcessSection';
import CurrentEvents from '@/components/home/CurrentEvents';
import MediaHighlights from '@/components/home/MediaHighlights';
import Testimonials from '@/components/home/Testimonials';
import ContactSection from '@/components/home/ContactSection';
import WatchLiveButton from '@/components/WatchLiveButton';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>ISKCON Juhu - Spiritual Center and Temple</title>
        <meta name="description" content="Experience spiritual bliss at ISKCON Juhu. Join us for divine celebrations, donate for noble causes, and connect with a vibrant spiritual community." />
        <meta property="og:title" content="ISKCON Juhu - Spiritual Center and Temple" />
        <meta property="og:description" content="Experience spiritual bliss at ISKCON Juhu. Join us for divine celebrations, donate for noble causes, and connect with a vibrant spiritual community." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://pixabay.com/get/g278ecce0ba61756c6b63480792d9ebbc528c6c2ca124b41aafeaaddb98ac5ee67ef5eb602cd0eb0b27645e6f00c4c672947df6b165a52a9b8c3a5795ffb5ad85_1280.jpg" />
      </Helmet>
      
      <Header />
      
      <main>
        <HeroSlider />
        <section className="temple-info-section">
          <TempleSchedule />
          <StatsSection />
        </section>
        <QuoteRotator />
        <DonationCategories />
        <ProcessSection />
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
