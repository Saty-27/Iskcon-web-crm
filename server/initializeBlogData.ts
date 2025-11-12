import { storage } from "./storage";

export async function initializeBlogData() {
  try {
    // Check if blog posts already exist
    const existingPosts = await storage.getBlogPosts();
    if (existingPosts.length > 0) {
      console.log("Blog posts already exist, skipping initialization");
      return;
    }

    // Sample blog posts data
    const sampleBlogPosts = [
      {
        title: "The Divine Teachings of Bhagavad Gita: A Guide for Modern Life",
        slug: "divine-teachings-bhagavad-gita-modern-life",
        excerpt: "Discover how the timeless wisdom of the Bhagavad Gita can transform your daily life and bring spiritual enlightenment in our modern world.",
        content: `The Bhagavad Gita, often called the Song of God, is one of the most revered spiritual texts in the world. This sacred dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra offers profound insights that remain relevant in our contemporary lives.

In our fast-paced modern world, we often find ourselves caught in the whirlwind of material pursuits, losing sight of our true purpose. The Gita teaches us the art of living with awareness, performing our duties without attachment to results.

Lord Krishna's teachings on dharma (righteous duty) remind us that every action should be performed with consciousness and dedication. Whether we are students, professionals, parents, or spiritual seekers, the principles of the Gita can guide us toward a more fulfilling existence.

The concept of yoga in the Gita goes beyond physical postures—it represents the union of the individual soul with the Supreme. Through karma yoga (the path of action), bhakti yoga (the path of devotion), and jnana yoga (the path of knowledge), we can achieve spiritual growth while fulfilling our worldly responsibilities.

As we navigate the challenges of modern life, let us remember Krishna's words: "You have the right to perform your prescribed duty, but not to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty."`,
        author: "Swami Prabhupada Disciple",
        readTime: 5,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date('2024-06-01')
      },
      {
        title: "Janmashtami Celebrations: Experiencing Krishna's Divine Love",
        slug: "janmashtami-celebrations-krishna-divine-love",
        excerpt: "Join us in celebrating the birth of Lord Krishna and experience the joy, devotion, and spiritual bliss that fills ISKCON Juhu during this sacred festival.",
        content: `Janmashtami, the celebration of Lord Krishna's appearance, is one of the most joyous festivals at ISKCON Juhu. Every year, thousands of devotees gather to commemorate the birth of the Supreme Personality of Godhead with immense devotion and spiritual fervor.

The festival begins with elaborate preparations that transform our temple into a divine abode. Beautiful decorations, fragrant flowers, and melodious kirtans create an atmosphere that transports every visitor to Vrindavan, Krishna's eternal realm.

Our Janmashtami celebrations feature traditional abhishek (bathing ceremony) of the deities, where Lord Krishna is lovingly bathed with milk, honey, ghee, and fragrant waters. The midnight celebration marks the exact moment of Krishna's appearance, filled with ecstatic dancing and singing of the holy names.

The festival is not just about external celebrations—it's an opportunity for inner transformation. As we participate in the festivities, we're reminded of Krishna's teachings about love, compassion, and surrender. The stories of Krishna's childhood pastimes inspire us to develop a loving relationship with the Divine.

Children perform beautiful cultural programs depicting Krishna's leelas (pastimes), while devotees offer heartfelt prayers and participate in communal feasting. The prasadam (sanctified food) distribution continues throughout the day, ensuring that everyone partakes in Krishna's mercy.

For those seeking spiritual growth, Janmashtami serves as a reminder that Krishna consciousness is not confined to a single day but should permeate every moment of our lives.`,
        author: "Temple Committee",
        readTime: 4,
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date('2024-08-15')
      },
      {
        title: "The Power of Congregational Chanting: Hare Krishna Mahamantra",
        slug: "power-congregational-chanting-hare-krishna-mahamantra",
        excerpt: "Experience the transformative power of chanting the Hare Krishna mahamantra in congregation and discover how this ancient practice purifies the heart and mind.",
        content: `The Hare Krishna mahamantra—Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare / Hare Rama, Hare Rama, Rama Rama, Hare Hare—is described in the Vedic scriptures as the most powerful spiritual practice for this age of Kali.

At ISKCON Juhu, our daily congregational chanting sessions create waves of spiritual energy that touch every heart present. When devotees come together to chant the holy names, the collective vibration creates an atmosphere of pure devotion and transcendental bliss.

Scientific studies have shown that chanting produces positive changes in brain chemistry, reducing stress and promoting mental clarity. But beyond the psychological benefits, the spiritual effects are profound. The mahamantra is a direct call to Krishna, expressing our desire to serve the Divine with love and devotion.

Our morning and evening kirtan sessions are open to all, regardless of background or experience. Many visitors share how their first experience of congregational chanting brought them peace they had never experienced before. The simple act of repeating these sacred names gradually cleanses the consciousness and awakens dormant love for God.

The beauty of the mahamantra lies in its simplicity—anyone can chant, anywhere, at any time. Whether you're stuck in traffic, walking in the park, or sitting in meditation, these names of God provide a direct connection to the Divine.

Regular participation in congregational chanting strengthens our spiritual foundation and helps us develop the qualities of humility, tolerance, and genuine care for others. As we progress in our chanting practice, we begin to taste the nectar of devotional service.`,
        author: "Kirtan Leader",
        readTime: 6,
        imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date('2024-09-20')
      },
      {
        title: "Prasadam: The Science of Sacred Food and Spiritual Nourishment",
        slug: "prasadam-science-sacred-food-spiritual-nourishment",
        excerpt: "Learn about the profound significance of prasadam in Krishna consciousness and how sanctified food becomes a medium for spiritual advancement and divine grace.",
        content: `Prasadam, meaning "mercy of the Lord," refers to food that has been offered to Krishna with love and devotion before being distributed to devotees and visitors. At ISKCON Juhu, the preparation and distribution of prasadam is considered one of our most important services.

The process of preparing prasadam begins with the careful selection of ingredients—only the finest, freshest, and purest foods are chosen. Our cooks, who are experienced devotees, prepare each dish with meditation on Krishna, chanting the holy names throughout the cooking process.

Before any food is distributed, it is first offered to our beautiful deities of Sri Sri Radha Rasabihari, accompanied by prayers and bhajans. This offering transforms ordinary food into prasadam—spiritually potent nourishment that purifies both body and soul.

The Vedic scriptures explain that when we consume prasadam, we're not just nourishing our physical body but also our spiritual essence. The consciousness of devotion infused into the food during preparation and offering creates positive karmic effects for both the cook and the consumer.

Our daily prasadam distribution serves hundreds of people, including temple visitors, local residents, and those in need. The free meal program embodies Krishna's teaching that no one should go hungry, especially when they've come seeking spiritual nourishment.

Many devotees share transformative experiences connected to prasadam—how their first taste opened their hearts to Krishna consciousness, or how regular consumption gradually refined their consciousness and reduced material desires.

The preparation of prasadam is also a meditative practice. Volunteers who join our kitchen service often describe it as one of the most fulfilling spiritual activities, where the simple act of cooking becomes an offering of love to the Divine.`,
        author: "Kitchen Coordinator",
        readTime: 5,
        imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date('2024-10-10')
      }
    ];

    // Create blog posts
    for (const post of sampleBlogPosts) {
      await storage.createBlogPost(post);
    }

    console.log(`Successfully initialized ${sampleBlogPosts.length} blog posts`);
  } catch (error) {
    console.error("Error initializing blog data:", error);
  }
}