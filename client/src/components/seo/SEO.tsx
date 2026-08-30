import { Helmet } from 'react-helmet';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  schemaType?: 'temple' | 'article' | 'donation' | 'event' | 'faq' | 'default';
  schemaData?: Record<string, any>;
  faqItems?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const DEFAULT_TITLE = 'ISKCON Juhu - Sri Sri Radha Rasabihari Temple | Mumbai';
const DEFAULT_DESCRIPTION = 'Official portal of ISKCON Juhu (Sri Sri Radha Rasabihari Temple), Hare Krishna Land, Mumbai. Experience daily darshan, live aartis, spiritual discourses, Anna Daan, and online 80G tax-exempt donations.';
const DEFAULT_KEYWORDS = 'ISKCON Juhu, ISKCON Mumbai, Sri Sri Radha Rasabihari, Hare Krishna, Hare Krishna Mahamantra, Srila Prabhupada, Temple Donation, Daan Seva, Anna Daan, Gau Seva, Bhagavad Gita, 80G Tax Exemption, Janmashtami Mumbai, Darshan Timings, Juhu Temple Aarti';
const DEFAULT_OG_IMAGE = 'https://iskconjuhu.in/uploads/gallery/gallery-1763557286466-32854043.jpg';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://iskconjuhu.in';

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author = 'ISKCON Juhu Media & Communications',
  schemaType = 'temple',
  schemaData,
  faqItems,
  breadcrumbs,
}: SEOProps) => {
  const fullTitle = title 
    ? (title.includes('ISKCON') ? title : `${title} | ISKCON Juhu - Sri Sri Radha Rasabihari Temple`)
    : DEFAULT_TITLE;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentUrl = canonicalUrl || `${SITE_URL}${currentPath}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  // 1. Base Temple & Organization Schema (Always high-ranking for temple and homepage)
  const templeOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'HinduTemple',
    '@id': `${SITE_URL}/#temple`,
    name: 'ISKCON Juhu - Sri Sri Radha Rasabihari Temple',
    alternateName: ['Hare Krishna Land Juhu', 'ISKCON Mumbai', 'Sri Sri Radha Rasabihari Mandir'],
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    image: [
      `${SITE_URL}/uploads/gallery/gallery-1763557286466-32854043.jpg`,
      `${SITE_URL}/uploads/gallery/gallery-1763557401997-179834597.jpg`
    ],
    description: DEFAULT_DESCRIPTION,
    telephone: '+91-22-26200360',
    email: 'contact@iskconjuhu.org',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Hare Krishna Land, Sri Mukteshwar Devalaya Marg, Juhu Church Road',
      addressLocality: 'Juhu, Mumbai',
      addressRegion: 'Maharashtra',
      postalCode: '400049',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.1031,
      longitude: 72.8267
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '04:30',
        closes: '13:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '16:30',
        closes: '21:00'
      }
    ],
    founder: {
      '@type': 'Person',
      name: 'His Divine Grace A.C. Bhaktivedanta Swami Prabhupada',
      honorificPrefix: 'Srila Prabhupada'
    },
    potentialAction: {
      '@type': 'DonateAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/donate`,
        actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform']
      },
      recipient: {
        '@type': 'Organization',
        name: 'ISKCON Juhu'
      }
    },
    sameAs: [
      'https://www.facebook.com/ISKCONJuhuMumbai',
      'https://www.instagram.com/iskcon_juhu',
      'https://www.youtube.com/user/iskconjuhu',
      'https://twitter.com/iskcon_juhu'
    ]
  };

  // 2. Article / Blog Schema
  const articleSchema = schemaType === 'article' && schemaData ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl
    },
    headline: title || schemaData.headline,
    description: description || schemaData.description,
    image: [fullOgImage],
    datePublished: publishedTime || schemaData.datePublished || new Date().toISOString(),
    dateModified: modifiedTime || schemaData.dateModified || publishedTime || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: author || schemaData.author || 'ISKCON Juhu Devotee Community'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ISKCON Juhu',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.png`
      }
    },
    keywords: keywords
  } : null;

  // 3. Donation & Charity Schema
  const donationSchema = schemaType === 'donation' ? {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'ISKCON Juhu Charitable & Daan Seva Trust',
    description: 'Tax-exempt charitable donations under Section 80G for Food for Life (Anna Daan), Cow Protection (Gau Seva), Vidyadaan, and Vedic Temple Seva.',
    url: `${SITE_URL}/donate`,
    potentialAction: {
      '@type': 'DonateAction',
      name: 'Online Temple Seva & Anna Daan Contribution',
      description: 'Donate online with instant 80G tax exemption receipt generation.',
      target: `${SITE_URL}/donate`
    }
  } : null;

  // 4. FAQ Schema for Rich Answer Cards in Search & AI
  const defaultFaqList = [
    {
      question: 'What are the temple darshan and aarti timings at ISKCON Juhu?',
      answer: 'ISKCON Juhu opens at 4:30 AM with Mangala Aarti and remains open until 1:00 PM. The temple reopens in the evening from 4:30 PM to 9:00 PM with Sandhya Aarti at 7:00 PM and Shayana Aarti at 8:30 PM.'
    },
    {
      question: 'Are donations to ISKCON Juhu tax-exempt under Section 80G?',
      answer: 'Yes, all donations made to ISKCON Juhu are 50% tax-exempt under Section 80G of the Indian Income Tax Act. Devotees receive an official computer-generated 80G tax receipt with a QR verification code immediately upon successful payment.'
    },
    {
      question: 'What charitable seva programs can I contribute to at ISKCON Juhu?',
      answer: 'Devotees can sponsor Anna Daan (Food for Life free sanctified meals), Gau Seva (Goshala cow feeding and protection), Gita Daan (Bhagavad Gita distribution), Deity Nitya Seva, and Grand Festival celebrations.'
    },
    {
      question: 'What is the Hare Krishna Mahamantra recited at ISKCON Juhu?',
      answer: 'The Hare Krishna Mahamantra is: "Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare / Hare Rama, Hare Rama, Rama Rama, Hare Hare". Chanting this mantra brings deep peace, spiritual elevation, and divine consciousness.'
    }
  ];

  const activeFaq = faqItems || (schemaType === 'temple' || schemaType === 'donation' ? defaultFaqList : null);

  const faqSchema = activeFaq && activeFaq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: activeFaq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  } : null;

  // 5. Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((bc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: bc.name,
      item: bc.url.startsWith('http') ? bc.url : `${SITE_URL}${bc.url}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={currentUrl} />

      {/* Language & Location */}
      <meta httpEquiv="content-language" content="en-IN, hi" />
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Juhu, Mumbai" />
      <meta name="geo.position" content="19.1031;72.8267" />
      <meta name="ICBM" content="19.1031, 72.8267" />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="ISKCON Juhu - Sri Sri Radha Rasabihari Temple" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="ISKCON Juhu Sri Sri Radha Rasabihari Temple" />
      <meta property="og:locale" content="en_IN" />

      {/* Article Specific Dates */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {schemaType === 'article' && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content="@iskcon_juhu" />

      {/* JSON-LD Schemas */}
      {schemaType === 'temple' && (
        <script type="application/ld+json">
          {JSON.stringify(templeOrganizationSchema)}
        </script>
      )}

      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}

      {donationSchema && (
        <script type="application/ld+json">
          {JSON.stringify(donationSchema)}
        </script>
      )}

      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Custom Schema Injection */}
      {schemaData && schemaType !== 'article' && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
