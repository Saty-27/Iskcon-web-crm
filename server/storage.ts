import {
  User, InsertUser, users, 
  Banner, InsertBanner, banners,
  Quote, InsertQuote, quotes,
  DonationCategory, InsertDonationCategory, donationCategories,
  DonationCard, InsertDonationCard, donationCards,
  EventDonationCard, InsertEventDonationCard, eventDonationCards,
  BankDetails, InsertBankDetails, bankDetails,
  CategoryBankDetails, InsertCategoryBankDetails, categoryBankDetails,
  Event, InsertEvent, events,
  Gallery, InsertGallery, gallery,
  Video, InsertVideo, videos,
  LiveVideo, InsertLiveVideo, liveVideos,
  Testimonial, InsertTestimonial, testimonials,
  ContactMessage, InsertContactMessage, contactMessages,
  SocialLink, InsertSocialLink, socialLinks,
  Donation, InsertDonation, donations,
  Subscription, InsertSubscription, subscriptions,
  Stat, InsertStat, stats,
  Schedule, InsertSchedule, schedules,
  BlogPost, InsertBlogPost, blogPosts
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Banner management
  getBanners(): Promise<Banner[]>;
  getBanner(id: number): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, bannerData: Partial<Banner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<boolean>;
  
  // Quote management
  getQuotes(): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quoteData: Partial<Quote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Donation category management
  getDonationCategories(): Promise<DonationCategory[]>;
  getDonationCategory(id: number): Promise<DonationCategory | undefined>;
  createDonationCategory(category: InsertDonationCategory): Promise<DonationCategory>;
  updateDonationCategory(id: number, categoryData: Partial<DonationCategory>): Promise<DonationCategory | undefined>;
  deleteDonationCategory(id: number): Promise<{ success: boolean; message?: string; deletedCards?: number }>;
  
  // Donation card management
  getDonationCards(): Promise<DonationCard[]>;
  getDonationCard(id: number): Promise<DonationCard | undefined>;
  getDonationCardsByCategory(categoryId: number): Promise<DonationCard[]>;
  createDonationCard(card: InsertDonationCard): Promise<DonationCard>;
  updateDonationCard(id: number, cardData: Partial<DonationCard>): Promise<DonationCard | undefined>;
  deleteDonationCard(id: number): Promise<boolean>;
  
  // Bank details management
  getBankDetails(): Promise<BankDetails[]>;
  getBankDetail(id: number): Promise<BankDetails | undefined>;
  createBankDetails(details: InsertBankDetails): Promise<BankDetails>;
  updateBankDetails(id: number, detailsData: Partial<BankDetails>): Promise<BankDetails | undefined>;
  deleteBankDetails(id: number): Promise<boolean>;
  
  // Event management
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event donation card management
  getEventDonationCards(eventId: number): Promise<EventDonationCard[]>;
  getEventDonationCard(id: number): Promise<EventDonationCard | undefined>;
  createEventDonationCard(card: InsertEventDonationCard): Promise<EventDonationCard>;
  updateEventDonationCard(id: number, cardData: Partial<EventDonationCard>): Promise<EventDonationCard | undefined>;
  deleteEventDonationCard(id: number): Promise<boolean>;
  
  // Event-specific bank details management
  getEventBankDetails(eventId: number): Promise<BankDetails[]>;
  getEventBankDetail(id: number): Promise<BankDetails | undefined>;
  createEventBankDetails(details: any): Promise<BankDetails>;
  updateEventBankDetails(id: number, detailsData: any): Promise<BankDetails | undefined>;
  deleteEventBankDetails(id: number): Promise<boolean>;
  
  // Category-specific bank details management
  getCategoryBankDetails(categoryId: number): Promise<CategoryBankDetails[]>;
  getCategoryBankDetail(id: number): Promise<CategoryBankDetails | undefined>;
  createCategoryBankDetails(details: InsertCategoryBankDetails): Promise<CategoryBankDetails>;
  updateCategoryBankDetails(id: number, detailsData: Partial<CategoryBankDetails>): Promise<CategoryBankDetails | undefined>;
  deleteCategoryBankDetails(id: number): Promise<boolean>;
  
  // Gallery management
  getGalleryItems(): Promise<Gallery[]>;
  getGalleryItem(id: number): Promise<Gallery | undefined>;
  createGalleryItem(galleryItem: InsertGallery): Promise<Gallery>;
  updateGalleryItem(id: number, galleryData: Partial<Gallery>): Promise<Gallery | undefined>;
  deleteGalleryItem(id: number): Promise<boolean>;
  
  // Video management
  getVideos(): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Live video management
  getLiveVideos(): Promise<LiveVideo[]>;
  getLiveVideo(id: number): Promise<LiveVideo | undefined>;
  createLiveVideo(liveVideo: InsertLiveVideo): Promise<LiveVideo>;
  updateLiveVideo(id: number, liveVideoData: Partial<LiveVideo>): Promise<LiveVideo | undefined>;
  deleteLiveVideo(id: number): Promise<boolean>;
  
  // Testimonial management
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonialData: Partial<Testimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Contact message management
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, messageData: Partial<ContactMessage>): Promise<ContactMessage | undefined>;
  markContactMessageAsRead(id: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  
  // Social link management
  getSocialLinks(): Promise<SocialLink[]>;
  getSocialLink(id: number): Promise<SocialLink | undefined>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, linkData: Partial<SocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: number): Promise<boolean>;
  
  // Donation management
  getDonations(): Promise<Donation[]>;
  getAllDonations(): Promise<any[]>;
  getDonation(id: number): Promise<Donation | undefined>;
  getDonationByPaymentId(paymentId: string): Promise<Donation | undefined>;
  getUserDonations(userId: number): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: number, donationData: Partial<Donation>): Promise<Donation | undefined>;
  deleteDonation(id: number): Promise<boolean>;
  
  // Subscription management
  getSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByEmail(email: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<boolean>;
  
  // Stats management
  getStats(): Promise<Stat[]>;
  getStat(id: number): Promise<Stat | undefined>;
  createStat(stat: InsertStat): Promise<Stat>;
  updateStat(id: number, statData: Partial<Stat>): Promise<Stat | undefined>;
  deleteStat(id: number): Promise<boolean>;
  
  // Schedule management
  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  
  // Blog post management
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private bannersData: Map<number, Banner>;
  private quotesData: Map<number, Quote>;
  private donationCategoriesData: Map<number, DonationCategory>;
  private donationCardsData: Map<number, DonationCard>;
  private eventDonationCardsData: Map<number, EventDonationCard>;
  private bankDetailsData: Map<number, BankDetails>;
  private eventsData: Map<number, Event>;
  private galleryData: Map<number, Gallery>;
  private videosData: Map<number, Video>;
  private liveVideosData: Map<number, LiveVideo>;
  private testimonialsData: Map<number, Testimonial>;
  private contactMessagesData: Map<number, ContactMessage>;
  private socialLinksData: Map<number, SocialLink>;
  private donationsData: Map<number, Donation>;
  private subscriptionsData: Map<number, Subscription>;
  private statsData: Map<number, Stat>;
  private schedulesData: Map<number, Schedule>;
  private blogPostsData: Map<number, BlogPost>;
  
  private userIdCounter: number;
  private bannerIdCounter: number;
  private quoteIdCounter: number;
  private donationCategoryIdCounter: number;
  private donationCardIdCounter: number;
  private eventDonationCardIdCounter: number;
  private bankDetailsIdCounter: number;
  private eventIdCounter: number;
  private galleryIdCounter: number;
  private videoIdCounter: number;
  private liveVideoIdCounter: number;
  private testimonialIdCounter: number;
  private contactMessageIdCounter: number;
  private socialLinkIdCounter: number;
  private donationIdCounter: number;
  private subscriptionIdCounter: number;
  private statIdCounter: number;
  private scheduleIdCounter: number;
  private blogPostIdCounter: number;

  constructor() {
    this.usersData = new Map();
    this.bannersData = new Map();
    this.quotesData = new Map();
    this.donationCategoriesData = new Map();
    this.donationCardsData = new Map();
    this.eventDonationCardsData = new Map();
    this.bankDetailsData = new Map();
    this.eventsData = new Map();
    this.galleryData = new Map();
    this.videosData = new Map();
    this.liveVideosData = new Map();
    this.testimonialsData = new Map();
    this.contactMessagesData = new Map();
    this.socialLinksData = new Map();
    this.donationsData = new Map();
    this.subscriptionsData = new Map();
    this.statsData = new Map();
    this.schedulesData = new Map();
    this.blogPostsData = new Map();
    
    this.userIdCounter = 1;
    this.bannerIdCounter = 1;
    this.quoteIdCounter = 1;
    this.donationCategoryIdCounter = 1;
    this.donationCardIdCounter = 1;
    this.eventDonationCardIdCounter = 1;
    this.bankDetailsIdCounter = 1;
    this.eventIdCounter = 1;
    this.galleryIdCounter = 1;
    this.videoIdCounter = 1;
    this.liveVideoIdCounter = 1;
    this.testimonialIdCounter = 1;
    this.contactMessageIdCounter = 1;
    this.socialLinkIdCounter = 1;
    this.donationIdCounter = 1;
    this.subscriptionIdCounter = 1;
    this.statIdCounter = 1;
    this.scheduleIdCounter = 1;
    this.blogPostIdCounter = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Add sample admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      email: "admin@iskconjuhu.in",
      name: "Admin User",
      role: "admin"
    });
    
    // Add sample banners
    this.createBanner({
      title: "Serve the Divine at ISKCON Juhu",
      description: "Experience spiritual bliss and connection through service and devotion",
      imageUrl: "https://pixabay.com/get/g278ecce0ba61756c6b63480792d9ebbc528c6c2ca124b41aafeaaddb98ac5ee67ef5eb602cd0eb0b27645e6f00c4c672947df6b165a52a9b8c3a5795ffb5ad85_1280.jpg",
      buttonText: "Donate Now",
      buttonLink: "/donate",
      isActive: true,
      order: 1
    });
    
    this.createBanner({
      title: "Experience Divine Celebrations",
      description: "Join us for festivals, pujas and spiritual gatherings",
      imageUrl: "https://pixabay.com/get/gcc14ed3b33044e8143fa8c9fe4bb1296145d6cc4a66cc8e6edb9ae4d0c20f9ba70962cb4c7a74229da33c8b7970e8561af9007654ddd6146cc6497facef83022_1280.jpg",
      buttonText: "View Events",
      buttonLink: "/events",
      isActive: true,
      order: 2
    });
    
    // Add sample quotes
    this.createQuote({
      text: "The Supreme Lord said: One who is unattached to the fruits of his work and who works as he is obligated is in the renounced order of life, and he is the true mystic, not he who lights no fire and performs no duty.",
      source: "Bhagavad Gita, Chapter 6, Verse 1",
      isActive: true,
      order: 1
    });
    
    this.createQuote({
      text: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, his mind will remain the greatest enemy.",
      source: "Bhagavad Gita, Chapter 6, Verse 6",
      isActive: true,
      order: 2
    });
    
    // Add sample donation categories
    this.createDonationCategory({
      name: "Temple Maintenance",
      description: "Help us maintain the beauty and sanctity of our temple for devotees and visitors.",
      imageUrl: "https://pixabay.com/get/g8c09814a2d11e292647b57cf1b11bcaf4309c6dea30c0f2501b4b406b4bab75410ad6e0f99150be2a61b5ec747ef3aebebe5f860a1351ad8e0a7a7743d1a2585_1280.jpg",
      isActive: true,
      order: 1,
      suggestedAmounts: [501, 1001, 2100, 5100]
    });
    
    this.createDonationCategory({
      name: "Food for Life",
      description: "Support our prasadam distribution program to feed the hungry and underprivileged.",
      imageUrl: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=800",
      isActive: true,
      order: 2,
      suggestedAmounts: [751, 1100, 2500, 5500]
    });
    
    this.createDonationCategory({
      name: "Spiritual Education",
      description: "Contribute to our educational programs, book distribution, and outreach activities.",
      imageUrl: "https://pixabay.com/get/gb34c35a7ff028913b431fcbf8667e2c516da7c19836673125d3803ea3dec70f5c8f99f744a0073e3d9f18e65f9cba86d36dfc661edbcf282c7c6a71598496e5e_1280.jpg",
      isActive: true,
      order: 3,
      suggestedAmounts: [351, 1001, 2100, 5100]
    });
    
    // Add sample events
    const janmashtamiDate = new Date("2023-08-19");
    this.createEvent({
      title: "Janmashtami Celebration",
      description: "Celebrate the divine appearance of Lord Krishna with abishekam, bhajans, and a midnight arati.",
      date: janmashtamiDate,
      imageUrl: "https://pixabay.com/get/ge1829aaad331ace25cb44b4f946c7c443eedfc6beccdf86149cfc06d104d3d285a629d8614baa8d1dd8b3b8b276cf58f1df1831e32c3955e6a191c0110f57367_1280.jpg",
      isActive: true,
      suggestedAmounts: [1008, 2108, 5100]
    });
    
    const govardhanDate = new Date("2023-11-03");
    this.createEvent({
      title: "Govardhan Puja",
      description: "Join us for the celebration of Govardhan Puja with a grand annakut offering and special darshan.",
      date: govardhanDate,
      imageUrl: "https://pixabay.com/get/g03af771720dcc680444483d020d22b6edbb961f9de1fcac2d9ba050ed21e23985fc9793f9c8f752e1687f3ff257f78beadc0d0ac3ed2f4bd2a1ef38c1dfc8b62_1280.jpg",
      isActive: true,
      suggestedAmounts: [1116, 2116, 5100]
    });
    
    // Add sample gallery items
    this.createGalleryItem({
      title: "Temple Deity",
      imageUrl: "https://pixabay.com/get/gcea6289d4616cfd955de212dac5582d4c38601d569fb7af04ba53652855979fb8e9bcf276b9d72a85398c09ea4598a8b85904d93940db6f284366d822b4ae76f_1280.jpg",
      order: 1
    });
    
    this.createGalleryItem({
      title: "Holi Festival",
      imageUrl: "https://images.unsplash.com/photo-1506941433945-99a2aa4bd50a?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300",
      order: 2
    });
    
    this.createGalleryItem({
      title: "Kirtan Session",
      imageUrl: "https://pixabay.com/get/g7f4978ace00e6486cc8dc574d3ed42fcb94e6144ae4be434c4e9fa669e551bd9b806ca47f9f7d3f953be5deb82a5138d7261b7b8a86be15f7d0121c80e7f2190_1280.jpg",
      order: 3
    });
    
    this.createGalleryItem({
      title: "Temple during Diwali",
      imageUrl: "https://pixabay.com/get/ge7c0d3d0f38575e56053956c82134fce2ce65a786f824f70fc891709b16fe060cf3b9869f0dc2c863104f92300c45a7aae95cbb4640efcb4df758ea7aede1dfb_1280.jpg",
      order: 4
    });
    
    this.createGalleryItem({
      title: "Spiritual Discourse",
      imageUrl: "https://pixabay.com/get/gb09db0496b8978cce6a1a4e7c02a7c96b925db9cc9ff1513885bcfaf8c34c6a3343fea7028997af707194a4b04f8a4632cf82d6caefbc238c0f06bc1efc590fd_1280.jpg",
      order: 5
    });
    
    this.createGalleryItem({
      title: "Temple Architecture",
      imageUrl: "https://images.unsplash.com/photo-1535191042502-e6a9a3d407e7?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300",
      order: 6
    });
    
    // Add sample videos
    this.createVideo({
      title: "Temple Aarti Ceremony",
      thumbnailUrl: "https://images.unsplash.com/photo-1599930113854-d6d7fd522504?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
      youtubeUrl: "https://www.youtube.com/watch?v=example1",
      order: 1
    });

    // Add sample live video
    this.createLiveVideo({
      title: "Live Temple Darshan",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      order: 1
    });
    
    this.createVideo({
      title: "Spiritual Discourse by Swami",
      thumbnailUrl: "https://images.unsplash.com/photo-1624085568108-36410cfe4d24?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
      youtubeUrl: "https://www.youtube.com/watch?v=example2",
      order: 2
    });
    
    // Add sample testimonials
    this.createTestimonial({
      name: "Priya Sharma",
      location: "Mumbai, India",
      message: "Visiting ISKCON Juhu temple regularly has brought peace and spiritual clarity to my life. The serene atmosphere and divine guidance have helped me navigate life's challenges with grace.",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=100",
      isActive: true
    });
    
    this.createTestimonial({
      name: "Rahul Patel",
      location: "Pune, India",
      message: "The spiritual programs at ISKCON Juhu have transformed my understanding of Vedic wisdom. The prasadam is divine, and the community feels like family. I've found my spiritual home here.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=100",
      isActive: true
    });
    
    this.createTestimonial({
      name: "Anjali Mehra",
      location: "Delhi, India",
      message: "Contributing to ISKCON Juhu's Food for Life program has been the most rewarding experience. Seeing the impact of providing prasadam to those in need fills my heart with joy and purpose.",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=100",
      isActive: true
    });
    
    // Add sample social links
    this.createSocialLink({
      platform: "Facebook",
      url: "https://facebook.com/iskconjuhu",
      icon: "ri-facebook-fill",
      isActive: true
    });
    
    this.createSocialLink({
      platform: "Instagram",
      url: "https://instagram.com/iskconjuhu",
      icon: "ri-instagram-fill",
      isActive: true
    });
    
    this.createSocialLink({
      platform: "YouTube",
      url: "https://youtube.com/iskconjuhu",
      icon: "ri-youtube-fill",
      isActive: true
    });
    
    this.createSocialLink({
      platform: "Twitter",
      url: "https://twitter.com/iskconjuhu",
      icon: "ri-twitter-fill",
      isActive: true
    });

    // Add sample events
    this.createEvent({
      title: "Janmashtami Celebration 2024",
      description: "Join us for the grand celebration of Lord Krishna's birth anniversary with special kirtans, abhishek ceremonies, and divine prasadam distribution.",
      date: new Date("2024-09-07"),
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
      isActive: true,
      suggestedAmounts: [501, 1001, 2501, 5001],
      readMoreUrl: "/events/janmashtami-2024",
      customDonationEnabled: true,
      customDonationTitle: "Support Janmashtami Celebration"
    });

    this.createEvent({
      title: "Food for Life - Community Kitchen",
      description: "Help us serve nutritious prasadam to underprivileged communities across Mumbai through our Food for Life program.",
      date: new Date("2024-08-15"),
      imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
      isActive: true,
      suggestedAmounts: [251, 501, 1001, 2501],
      readMoreUrl: "/events/food-for-life",
      customDonationEnabled: true,
      customDonationTitle: "Sponsor Meals for the Needy"
    });

    this.createEvent({
      title: "Temple Renovation Project",
      description: "Contribute to the restoration and beautification of our sacred temple premises to provide a better spiritual environment for devotees.",
      date: new Date("2024-09-01"),
      imageUrl: "https://images.unsplash.com/photo-1574666411985-31b06fc26a73?ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=600",
      isActive: true,
      suggestedAmounts: [1001, 5001, 10001, 25001],
      readMoreUrl: "/events/temple-renovation",
      customDonationEnabled: true,
      customDonationTitle: "Support Temple Infrastructure"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id, 
      isActive: true,
      phone: user.phone ?? null,
      role: user.role ?? "user"
    };
    this.usersData.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.usersData.delete(id);
  }

  // Banner methods
  async getBanners(): Promise<Banner[]> {
    return Array.from(this.bannersData.values())
      .sort((a, b) => a.order - b.order);
  }

  async getBanner(id: number): Promise<Banner | undefined> {
    return this.bannersData.get(id);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const id = this.bannerIdCounter++;
    const newBanner: Banner = { 
      ...banner, 
      id,
      isActive: banner.isActive ?? true,
      description: banner.description ?? null,
      buttonText: banner.buttonText ?? null,
      buttonLink: banner.buttonLink ?? null
    };
    this.bannersData.set(id, newBanner);
    return newBanner;
  }

  async updateBanner(id: number, bannerData: Partial<Banner>): Promise<Banner | undefined> {
    const banner = this.bannersData.get(id);
    if (!banner) return undefined;
    
    const updatedBanner = { ...banner, ...bannerData };
    this.bannersData.set(id, updatedBanner);
    return updatedBanner;
  }

  async deleteBanner(id: number): Promise<boolean> {
    return this.bannersData.delete(id);
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotesData.values())
      .sort((a, b) => a.order - b.order);
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotesData.get(id);
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const id = this.quoteIdCounter++;
    const newQuote: Quote = { 
      ...quote, 
      id,
      isActive: quote.isActive ?? true,
      source: quote.source ?? null
    };
    this.quotesData.set(id, newQuote);
    return newQuote;
  }

  async updateQuote(id: number, quoteData: Partial<Quote>): Promise<Quote | undefined> {
    const quote = this.quotesData.get(id);
    if (!quote) return undefined;
    
    const updatedQuote = { ...quote, ...quoteData };
    this.quotesData.set(id, updatedQuote);
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    return this.quotesData.delete(id);
  }

  // Donation category methods
  async getDonationCategories(): Promise<DonationCategory[]> {
    return Array.from(this.donationCategoriesData.values())
      .sort((a, b) => a.order - b.order);
  }

  async getDonationCategory(id: number): Promise<DonationCategory | undefined> {
    return this.donationCategoriesData.get(id);
  }

  async createDonationCategory(category: InsertDonationCategory): Promise<DonationCategory> {
    const id = this.donationCategoryIdCounter++;
    const newCategory: DonationCategory = { 
      ...category, 
      id,
      isActive: category.isActive ?? true,
      description: category.description ?? null,
      heading: category.heading ?? null,
      suggestedAmounts: (category.suggestedAmounts as number[]) ?? null
    };
    this.donationCategoriesData.set(id, newCategory);
    return newCategory;
  }

  async updateDonationCategory(id: number, categoryData: Partial<DonationCategory>): Promise<DonationCategory | undefined> {
    const category = this.donationCategoriesData.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.donationCategoriesData.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteDonationCategory(id: number): Promise<{ success: boolean; message?: string; deletedCards?: number }> {
    // In memory storage doesn't have foreign key constraints, so we can delete directly
    const success = this.donationCategoriesData.delete(id);
    
    // Also delete related donation cards
    const relatedCards = Array.from(this.donationCardsData.values()).filter(card => card.categoryId === id);
    let deletedCards = 0;
    
    for (const card of relatedCards) {
      if (this.donationCardsData.delete(card.id)) {
        deletedCards++;
      }
    }
    
    return {
      success,
      deletedCards
    };
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.eventsData.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventsData.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    const newEvent: Event = { 
      ...event, 
      id, 
      createdAt: now,
      updatedAt: now,
      customDonationEnabled: event.customDonationEnabled ?? true,
      customDonationTitle: event.customDonationTitle ?? "Any Donation of Your Choice",
      isActive: event.isActive ?? true,
      description: event.description ?? null,
      suggestedAmounts: (event.suggestedAmounts as number[]) ?? null,
      readMoreUrl: event.readMoreUrl ?? null
    };
    this.eventsData.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = this.eventsData.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.eventsData.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.eventsData.delete(id);
  }

  // Donation card methods
  async getDonationCards(): Promise<DonationCard[]> {
    return Array.from(this.donationCardsData.values())
      .sort((a, b) => a.order - b.order);
  }

  async getDonationCard(id: number): Promise<DonationCard | undefined> {
    return this.donationCardsData.get(id);
  }

  async getDonationCardsByCategory(categoryId: number): Promise<DonationCard[]> {
    return Array.from(this.donationCardsData.values())
      .filter(card => card.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async createDonationCard(card: InsertDonationCard): Promise<DonationCard> {
    const id = this.donationCardIdCounter++;
    const newCard: DonationCard = { 
      ...card, 
      id,
      isActive: card.isActive ?? true,
      order: card.order ?? 0,
      description: card.description ?? null,
      imageUrl: card.imageUrl ?? null
    };
    this.donationCardsData.set(id, newCard);
    return newCard;
  }

  async updateDonationCard(id: number, cardData: Partial<DonationCard>): Promise<DonationCard | undefined> {
    const card = this.donationCardsData.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...cardData };
    this.donationCardsData.set(id, updatedCard);
    return updatedCard;
  }

  async deleteDonationCard(id: number): Promise<boolean> {
    return this.donationCardsData.delete(id);
  }

  // Bank details methods
  async getBankDetails(): Promise<BankDetails[]> {
    return Array.from(this.bankDetailsData.values());
  }

  async getBankDetail(id: number): Promise<BankDetails | undefined> {
    return this.bankDetailsData.get(id);
  }

  async createBankDetails(details: InsertBankDetails): Promise<BankDetails> {
    const id = this.bankDetailsIdCounter++;
    const newDetails: BankDetails = { 
      ...details, 
      id,
      isActive: details.isActive ?? true,
      swiftCode: details.swiftCode ?? null,
      qrCodeUrl: details.qrCodeUrl ?? null
    };
    this.bankDetailsData.set(id, newDetails);
    return newDetails;
  }

  async updateBankDetails(id: number, detailsData: Partial<BankDetails>): Promise<BankDetails | undefined> {
    const details = this.bankDetailsData.get(id);
    if (!details) return undefined;
    
    const updatedDetails = { ...details, ...detailsData };
    this.bankDetailsData.set(id, updatedDetails);
    return updatedDetails;
  }

  async deleteBankDetails(id: number): Promise<boolean> {
    return this.bankDetailsData.delete(id);
  }

  // Social link methods
  async getSocialLinks(): Promise<SocialLink[]> {
    return Array.from(this.socialLinksData.values());
  }

  async getSocialLink(id: number): Promise<SocialLink | undefined> {
    return this.socialLinksData.get(id);
  }

  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    const id = this.socialLinkIdCounter++;
    const newLink: SocialLink = { 
      ...link, 
      id,
      isActive: link.isActive ?? true
    };
    this.socialLinksData.set(id, newLink);
    return newLink;
  }

  async updateSocialLink(id: number, linkData: Partial<SocialLink>): Promise<SocialLink | undefined> {
    const link = this.socialLinksData.get(id);
    if (!link) return undefined;
    
    const updatedLink = { ...link, ...linkData };
    this.socialLinksData.set(id, updatedLink);
    return updatedLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    return this.socialLinksData.delete(id);
  }

  // Donation methods
  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donationsData.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllDonations(): Promise<any[]> {
    const donations = Array.from(this.donationsData.values());
    const categories = Array.from(this.donationCategoriesData.values());
    const events = Array.from(this.eventsData.values());
    
    return donations.map(donation => {
      const category = categories.find(c => c.id === donation.categoryId);
      const event = events.find(e => e.id === donation.eventId);
      
      return {
        id: donation.id,
        amount: donation.amount,
        name: donation.name,
        email: donation.email,
        phone: donation.phone,
        address: donation.address,
        panCard: donation.panCard,
        message: donation.message,
        paymentId: donation.paymentId,
        status: donation.status,
        createdAt: donation.createdAt,
        categoryName: category?.name || null,
        eventTitle: event?.title || null,
        invoiceNumber: donation.invoiceNumber,
        receiptSent: donation.receiptSent,
        notificationSent: donation.notificationSent
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donationsData.get(id);
  }

  async getDonationByPaymentId(paymentId: string): Promise<Donation | undefined> {
    return Array.from(this.donationsData.values()).find(
      donation => donation.paymentId === paymentId
    );
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    return Array.from(this.donationsData.values())
      .filter(donation => donation.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = this.donationIdCounter++;
    const now = new Date();
    const newDonation: Donation = { 
      ...donation, 
      id,
      createdAt: now,
      status: donation.status ?? "pending",
      receiptSent: donation.receiptSent ?? false,
      notificationSent: donation.notificationSent ?? false,
      message: donation.message ?? null,
      userId: donation.userId ?? null,
      eventId: donation.eventId ?? null,
      categoryId: donation.categoryId ?? null,
      paymentId: donation.paymentId ?? null,
      invoiceNumber: donation.invoiceNumber ?? null,
      panCard: donation.panCard ?? null
    };
    this.donationsData.set(id, newDonation);
    return newDonation;
  }

  async updateDonation(id: number, donationData: Partial<Donation>): Promise<Donation | undefined> {
    const donation = this.donationsData.get(id);
    if (!donation) return undefined;
    
    const updatedDonation = { ...donation, ...donationData };
    this.donationsData.set(id, updatedDonation);
    return updatedDonation;
  }

  async deleteDonation(id: number): Promise<boolean> {
    return this.donationsData.delete(id);
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptionsData.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptionsData.get(id);
  }

  async getSubscriptionByEmail(email: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptionsData.values()).find(
      subscription => subscription.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const now = new Date();
    const newSubscription: Subscription = { 
      ...subscription, 
      id,
      createdAt: now,
      isActive: true
    };
    this.subscriptionsData.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptionsData.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, ...subscriptionData };
    this.subscriptionsData.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async deleteSubscription(id: number): Promise<boolean> {
    return this.subscriptionsData.delete(id);
  }

  // Stats methods
  async getStats(): Promise<Stat[]> {
    return Array.from(this.statsData.values())
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  async getStat(id: number): Promise<Stat | undefined> {
    return this.statsData.get(id);
  }

  async createStat(stat: InsertStat): Promise<Stat> {
    const id = this.statIdCounter++;
    const newStat: Stat = { 
      ...stat, 
      id,
      isActive: stat.isActive ?? true,
      createdAt: stat.createdAt ?? null,
      updatedAt: stat.updatedAt ?? null,
      orderIndex: stat.orderIndex ?? null
    };
    this.statsData.set(id, newStat);
    return newStat;
  }

  async updateStat(id: number, statData: Partial<Stat>): Promise<Stat | undefined> {
    const stat = this.statsData.get(id);
    if (!stat) return undefined;
    
    const updatedStat = { ...stat, ...statData };
    this.statsData.set(id, updatedStat);
    return updatedStat;
  }

  async deleteStat(id: number): Promise<boolean> {
    return this.statsData.delete(id);
  }

  // Schedule methods
  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedulesData.values())
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedulesData.get(id);
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const now = new Date();
    const newSchedule: Schedule = { 
      ...schedule, 
      id,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      description: schedule.description ?? null,
      orderIndex: schedule.orderIndex ?? null
    };
    this.schedulesData.set(id, newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | undefined> {
    const schedule = this.schedulesData.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule = { ...schedule, ...scheduleData, updatedAt: new Date() };
    this.schedulesData.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedulesData.delete(id);
  }

  // Gallery methods
  async getGalleryItems(): Promise<Gallery[]> {
    return Array.from(this.galleryData.values())
      .sort((a, b) => a.order - b.order);
  }

  async getGalleryItem(id: number): Promise<Gallery | undefined> {
    return this.galleryData.get(id);
  }

  async createGalleryItem(galleryItem: InsertGallery): Promise<Gallery> {
    const id = this.galleryIdCounter++;
    const newGalleryItem: Gallery = { ...galleryItem, id };
    this.galleryData.set(id, newGalleryItem);
    return newGalleryItem;
  }

  async updateGalleryItem(id: number, galleryData: Partial<Gallery>): Promise<Gallery | undefined> {
    const galleryItem = this.galleryData.get(id);
    if (!galleryItem) return undefined;
    
    const updatedGalleryItem = { ...galleryItem, ...galleryData };
    this.galleryData.set(id, updatedGalleryItem);
    return updatedGalleryItem;
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    return this.galleryData.delete(id);
  }

  // Video methods
  async getVideos(): Promise<Video[]> {
    return Array.from(this.videosData.values())
      .sort((a, b) => a.order - b.order);
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videosData.get(id);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const newVideo: Video = { ...video, id };
    this.videosData.set(id, newVideo);
    return newVideo;
  }

  async updateVideo(id: number, videoData: Partial<Video>): Promise<Video | undefined> {
    const video = this.videosData.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, ...videoData };
    this.videosData.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.videosData.delete(id);
  }

  // Live video methods
  async getLiveVideos(): Promise<LiveVideo[]> {
    return Array.from(this.liveVideosData.values())
      .filter(v => v.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async getLiveVideo(id: number): Promise<LiveVideo | undefined> {
    return this.liveVideosData.get(id);
  }

  async createLiveVideo(liveVideo: InsertLiveVideo): Promise<LiveVideo> {
    const id = this.liveVideoIdCounter++;
    const now = new Date();
    const newLiveVideo: LiveVideo = { 
      ...liveVideo, 
      id,
      createdAt: now,
      updatedAt: now,
      isActive: liveVideo.isActive ?? true
    };
    this.liveVideosData.set(id, newLiveVideo);
    return newLiveVideo;
  }

  async updateLiveVideo(id: number, liveVideoData: Partial<LiveVideo>): Promise<LiveVideo | undefined> {
    const liveVideo = this.liveVideosData.get(id);
    if (!liveVideo) return undefined;
    
    const updatedLiveVideo = { ...liveVideo, ...liveVideoData, updatedAt: new Date() };
    this.liveVideosData.set(id, updatedLiveVideo);
    return updatedLiveVideo;
  }

  async deleteLiveVideo(id: number): Promise<boolean> {
    return this.liveVideosData.delete(id);
  }

  // Testimonial methods
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonialsData.values())
      .filter(t => t.isActive);
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonialsData.get(id);
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const newTestimonial: Testimonial = { 
      ...testimonial, 
      id,
      isActive: testimonial.isActive ?? true,
      imageUrl: testimonial.imageUrl ?? null
    };
    this.testimonialsData.set(id, newTestimonial);
    return newTestimonial;
  }

  async updateTestimonial(id: number, testimonialData: Partial<Testimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonialsData.get(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial = { ...testimonial, ...testimonialData };
    this.testimonialsData.set(id, updatedTestimonial);
    return updatedTestimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonialsData.delete(id);
  }

  // Contact message methods
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessagesData.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessagesData.get(id);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const newMessage: ContactMessage = { 
      ...message, 
      id, 
      isRead: false, 
      createdAt: new Date(),

    };
    this.contactMessagesData.set(id, newMessage);
    return newMessage;
  }

  async updateContactMessage(id: number, messageData: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const message = this.contactMessagesData.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...messageData };
    this.contactMessagesData.set(id, updatedMessage);
    return updatedMessage;
  }

  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    const message = this.contactMessagesData.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.contactMessagesData.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    return this.contactMessagesData.delete(id);
  }

  // Event donation card operations
  async getEventDonationCards(eventId: number): Promise<EventDonationCard[]> {
    return Array.from(this.eventDonationCardsData.values()).filter(card => card.eventId === eventId);
  }

  async getEventDonationCard(id: number): Promise<EventDonationCard | undefined> {
    return this.eventDonationCardsData.get(id);
  }

  async createEventDonationCard(card: InsertEventDonationCard): Promise<EventDonationCard> {
    const id = this.eventDonationCardIdCounter++;
    const newCard: EventDonationCard = { ...card, id };
    this.eventDonationCardsData.set(id, newCard);
    return newCard;
  }

  async updateEventDonationCard(id: number, cardData: Partial<EventDonationCard>): Promise<EventDonationCard | undefined> {
    const card = this.eventDonationCardsData.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...cardData };
    this.eventDonationCardsData.set(id, updatedCard);
    return updatedCard;
  }

  async deleteEventDonationCard(id: number): Promise<boolean> {
    return this.eventDonationCardsData.delete(id);
  }

  // Blog post operations
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPostsData.values());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPostsData.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPostsData.values()).find(post => post.slug === slug);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const newPost: BlogPost = { 
      ...post, 
      id,
      isPublished: post.isPublished ?? true,
      publishedAt: post.publishedAt ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogPostsData.set(id, newPost);
    return newPost;
  }

  async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPostsData.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...postData, updatedAt: new Date() };
    this.blogPostsData.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPostsData.delete(id);
  }

  // Event-specific bank details methods
  async getEventBankDetails(eventId: number): Promise<BankDetails[]> {
    return Array.from(this.bankDetailsData.values())
      .filter(bd => (bd as any).eventId === eventId);
  }

  async getEventBankDetail(id: number): Promise<BankDetails | undefined> {
    return this.bankDetailsData.get(id);
  }

  async createEventBankDetails(details: any): Promise<BankDetails> {
    const id = this.bankDetailsIdCounter++;
    const newDetails: BankDetails = { 
      ...details, 
      id,
      eventId: details.eventId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bankDetailsData.set(id, newDetails);
    return newDetails;
  }

  async updateEventBankDetails(id: number, detailsData: any): Promise<BankDetails | undefined> {
    const details = this.bankDetailsData.get(id);
    if (!details) return undefined;
    
    const updatedDetails = { ...details, ...detailsData, updatedAt: new Date() };
    this.bankDetailsData.set(id, updatedDetails);
    return updatedDetails;
  }

  async deleteEventBankDetails(id: number): Promise<boolean> {
    return this.bankDetailsData.delete(id);
  }
}

import { DatabaseStorage } from "./dbStorage";

export const storage = new DatabaseStorage();
