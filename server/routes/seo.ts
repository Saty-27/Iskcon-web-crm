import { Express, Request, Response } from "express";
import { storage } from "../storage";

/**
 * Register dynamic SEO, Sitemap, Robots.txt, and AI LLM manifest endpoints
 */
export function registerSeoRoutes(app: Express) {
  // 1. Dynamic sitemap.xml
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'iskconjuhu.in';
      const baseUrl = `${protocol}://${host}`;

      const now = new Date().toISOString().split('T')[0];

      // Fetch dynamic content from database
      const [blogPosts, categories, events] = await Promise.all([
        storage.getBlogPosts().catch(() => []),
        storage.getDonationCategories().catch(() => []),
        storage.getEvents().catch(() => []),
      ]);

      // Core static public pages
      const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0', lastmod: now },
        { url: '/donate', changefreq: 'weekly', priority: '0.95', lastmod: now },
        { url: '/events', changefreq: 'weekly', priority: '0.9', lastmod: now },
        { url: '/blog', changefreq: 'daily', priority: '0.9', lastmod: now },
        { url: '/gallery', changefreq: 'weekly', priority: '0.8', lastmod: now },
        { url: '/videos', changefreq: 'weekly', priority: '0.75', lastmod: now },
        { url: '/contact', changefreq: 'monthly', priority: '0.8', lastmod: now },
        { url: '/login', changefreq: 'monthly', priority: '0.5', lastmod: now },
        { url: '/register', changefreq: 'monthly', priority: '0.5', lastmod: now },
      ];

      // Dynamic blog post pages
      const blogUrls = blogPosts
        .filter((post) => post.isPublished && post.slug)
        .map((post) => {
          const lastmod = post.updatedAt 
            ? new Date(post.updatedAt).toISOString().split('T')[0]
            : (post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : now);

          return {
            url: `/blog/${encodeURIComponent(post.slug)}`,
            changefreq: 'monthly',
            priority: '0.85',
            lastmod,
          };
        });

      // Dynamic donation category pages
      const categoryUrls = categories
        .filter((cat) => cat.isActive)
        .map((cat) => ({
          url: `/donate/category/${cat.id}`,
          changefreq: 'weekly',
          priority: '0.9',
          lastmod: now,
        }));

      // Dynamic event donation pages
      const eventUrls = events
        .filter((evt) => evt.isActive)
        .map((evt) => ({
          url: `/donate/event/${evt.id}`,
          changefreq: 'weekly',
          priority: '0.85',
          lastmod: evt.updatedAt 
            ? new Date(evt.updatedAt).toISOString().split('T')[0] 
            : now,
        }));

      const allUrls = [...staticPages, ...categoryUrls, ...eventUrls, ...blogUrls];

      // Build XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
      xml += 'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" ';
      xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml" ';
      xml += 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ';
      xml += 'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

      for (const item of allUrls) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${item.url}</loc>\n`;
        xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
        xml += `    <priority>${item.priority}</priority>\n`;
        xml += '  </url>\n';
      }

      xml += '</urlset>';

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // 2. Robots.txt for Search Engines and AI Crawlers
  app.get("/robots.txt", (req: Request, res: Response) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'iskconjuhu.in';
    const baseUrl = `${protocol}://${host}`;

    const robotsContent = `# ISKCON Juhu Mumbai - Robots & AI Crawler Directives
# Sri Sri Radha Rasabihari Temple, Juhu, Mumbai

User-agent: *
Allow: /
Allow: /events
Allow: /donate
Allow: /donate/*
Allow: /blog
Allow: /blog/*
Allow: /gallery
Allow: /videos
Allow: /contact
Allow: /uploads/*
Disallow: /admin
Disallow: /admin/*
Disallow: /api/admin/*
Disallow: /api/auth/*
Disallow: /api/chat/*
Disallow: /api/payment/*

# Explicit Authorization for AI Search & Answer Engines (GEO Optimization)
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: ChatGPT-User
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Google-Extended
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Claude-Web
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: anthropic-ai
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Applebot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Amazonbot
Allow: /
Disallow: /admin/
Disallow: /api/

# Sitemap Location
Sitemap: ${baseUrl}/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(robotsContent);
  });

  // 3. AI Knowledge Manifest (llms.txt) for LLM / AI Search Indexing
  app.get("/llms.txt", (req: Request, res: Response) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'iskconjuhu.in';
    const baseUrl = `${protocol}://${host}`;

    const llmsContent = `# ISKCON Juhu - Sri Sri Radha Rasabihari Temple

> Official AI Summary and Knowledge Manifest for ISKCON Juhu (International Society for Krishna Consciousness), Mumbai, India.

## Organization & Temple Overview
- **Official Name**: International Society for Krishna Consciousness (ISKCON) Juhu
- **Temple Name**: Sri Sri Radha Rasabihari Temple / Hare Krishna Land
- **Founder-Acharya**: His Divine Grace A.C. Bhaktivedanta Swami Prabhupada (Srila Prabhupada)
- **Location**: Hare Krishna Land, Sri Mukteshwar Devalaya Marg, Juhu, Mumbai, Maharashtra 400049, India
- **Phone**: +91-22-26200360 / +91-22-26206860
- **Official Website**: ${baseUrl}

## Presiding Deities
1. **Sri Sri Radha Rasabihariji** (Radha and Krishna)
2. **Sri Sri Gaura Nitai** (Chaitanya Mahaprabhu and Nityananda Prabhu)
3. **Sri Sri Sita Rama Lakshman Hanuman**

## Core Spiritual Philosophy & Mahamantra
ISKCON follows the Gaudiya Vaishnava tradition originating from Sri Chaitanya Mahaprabhu, based on the Bhagavad Gita As It Is and Srimad Bhagavatam.
The foundational chanting practice is the Hare Krishna Mahamantra:
> *Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare*
> *Hare Rama, Hare Rama, Rama Rama, Hare Hare*

## Daily Temple Timings & Aarti Schedule
- **Mangala Aarti**: 04:30 AM
- **Tulsi Aarti**: 05:00 AM
- **Japa Meditation**: 05:15 AM - 07:15 AM
- **Shringar Darshan & Aarti**: 07:15 AM
- **Srila Prabhupada Guru Puja**: 07:30 AM
- **Srimad Bhagavatam Discourse**: 08:00 AM
- **Raj Bhoga Aarti**: 12:30 PM
- **Temple Closes**: 01:00 PM - 04:30 PM
- **Dhoop Aarti**: 04:30 PM
- **Sandhya (Gaura) Aarti**: 07:00 PM
- **Bhagavad Gita Discourse**: 07:45 PM
- **Shayana Aarti**: 08:30 PM
- **Temple Closes**: 09:00 PM

## Charitable Seva & Online Donation Programs
All online donations to ISKCON Juhu are eligible for tax exemption under **Section 80G** of the Indian Income Tax Act.
- **Anna Daan (Food for Life)**: Daily free nutritious sanctified prasadam distribution to thousands of underprivileged people and pilgrims.
- **Gau Seva**: Protection, feeding, and medical care for sacred cows at the temple goshala.
- **Gita Daan / Vidyadaan**: Distribution of spiritual literature and Vedic education to students and youth.
- **Temple & Deity Seva**: Daily worship, flower garlands, chappan bhog offerings, and festival celebrations.
- **Festival Sponsorship**: Grand celebrations of Sri Krishna Janmashtami, Radhashtami, Ratha Yatra, Gaura Purnima, and Govardhan Puja.
- **Online Donation Link**: ${baseUrl}/donate

## Key URLs for Devotees
- Home: ${baseUrl}/
- Online Daan / Donations (80G): ${baseUrl}/donate
- Festivals & Events: ${baseUrl}/events
- Temple Darshan Gallery: ${baseUrl}/gallery
- Spiritual Discourses & Blog: ${baseUrl}/blog
- Video Library & Live Streams: ${baseUrl}/videos
- Contact & Location: ${baseUrl}/contact
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(llmsContent);
  });
}
