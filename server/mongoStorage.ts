import { IStorage } from './storage';
import User from './models/User';
import Banner from './models/Banner';
import Quote from './models/Quote';
import DonationCategory from './models/DonationCategory';
import Event from './models/Event';
import Gallery from './models/Gallery';
import Video from './models/Video';
import Testimonial from './models/Testimonial';
import ContactMessage from './models/ContactMessage';
import SocialLink from './models/SocialLink';
import Donation from './models/Donation';
import Subscription from './models/Subscription';
import mongoose from 'mongoose';

export class MongoStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<any | undefined> {
    try {
      const user = await User.findById(id);
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    try {
      const user = await User.findOne({ email });
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      const newUser = new User(user);
      await newUser.save();
      return newUser.toObject();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUsers(): Promise<any[]> {
    try {
      const users = await User.find();
      return users.map(user => user.toObject());
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async updateUser(id: number, userData: any): Promise<any | undefined> {
    try {
      const user = await User.findByIdAndUpdate(id, userData, { new: true });
      return user ? user.toObject() : undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Banner management
  async getBanners(): Promise<any[]> {
    try {
      const banners = await Banner.find().sort({ order: 1 });
      return banners.map(banner => banner.toObject());
    } catch (error) {
      console.error('Error getting all banners:', error);
      return [];
    }
  }

  async getBanner(id: number): Promise<any | undefined> {
    try {
      const banner = await Banner.findById(id);
      return banner ? banner.toObject() : undefined;
    } catch (error) {
      console.error('Error getting banner by ID:', error);
      return undefined;
    }
  }

  async createBanner(banner: any): Promise<any> {
    try {
      const newBanner = new Banner(banner);
      await newBanner.save();
      return newBanner.toObject();
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  }

  async updateBanner(id: number, bannerData: any): Promise<any | undefined> {
    try {
      const banner = await Banner.findByIdAndUpdate(id, bannerData, { new: true });
      return banner ? banner.toObject() : undefined;
    } catch (error) {
      console.error('Error updating banner:', error);
      return undefined;
    }
  }

  async deleteBanner(id: number): Promise<boolean> {
    try {
      const result = await Banner.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting banner:', error);
      return false;
    }
  }

  // Quote management
  async getQuotes(): Promise<any[]> {
    try {
      const quotes = await Quote.find().sort({ order: 1 });
      return quotes.map(quote => quote.toObject());
    } catch (error) {
      console.error('Error getting all quotes:', error);
      return [];
    }
  }

  async getQuote(id: number): Promise<any | undefined> {
    try {
      const quote = await Quote.findById(id);
      return quote ? quote.toObject() : undefined;
    } catch (error) {
      console.error('Error getting quote by ID:', error);
      return undefined;
    }
  }

  async createQuote(quote: any): Promise<any> {
    try {
      const newQuote = new Quote(quote);
      await newQuote.save();
      return newQuote.toObject();
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }

  async updateQuote(id: number, quoteData: any): Promise<any | undefined> {
    try {
      const quote = await Quote.findByIdAndUpdate(id, quoteData, { new: true });
      return quote ? quote.toObject() : undefined;
    } catch (error) {
      console.error('Error updating quote:', error);
      return undefined;
    }
  }

  async deleteQuote(id: number): Promise<boolean> {
    try {
      const result = await Quote.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting quote:', error);
      return false;
    }
  }

  // Donation category management
  async getDonationCategories(): Promise<any[]> {
    try {
      const categories = await DonationCategory.find().sort({ order: 1 });
      return categories.map(category => category.toObject());
    } catch (error) {
      console.error('Error getting all donation categories:', error);
      return [];
    }
  }

  async getDonationCategory(id: number): Promise<any | undefined> {
    try {
      const category = await DonationCategory.findById(id);
      return category ? category.toObject() : undefined;
    } catch (error) {
      console.error('Error getting donation category by ID:', error);
      return undefined;
    }
  }

  async createDonationCategory(category: any): Promise<any> {
    try {
      const newCategory = new DonationCategory(category);
      await newCategory.save();
      return newCategory.toObject();
    } catch (error) {
      console.error('Error creating donation category:', error);
      throw error;
    }
  }

  async updateDonationCategory(id: number, categoryData: any): Promise<any | undefined> {
    try {
      const category = await DonationCategory.findByIdAndUpdate(id, categoryData, { new: true });
      return category ? category.toObject() : undefined;
    } catch (error) {
      console.error('Error updating donation category:', error);
      return undefined;
    }
  }

  async deleteDonationCategory(id: number): Promise<boolean> {
    try {
      const result = await DonationCategory.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting donation category:', error);
      return false;
    }
  }

  // Event management
  async getEvents(): Promise<any[]> {
    try {
      const events = await Event.find().sort({ date: 1 });
      return events.map(event => event.toObject());
    } catch (error) {
      console.error('Error getting all events:', error);
      return [];
    }
  }

  async getEvent(id: number): Promise<any | undefined> {
    try {
      const event = await Event.findById(id);
      return event ? event.toObject() : undefined;
    } catch (error) {
      console.error('Error getting event by ID:', error);
      return undefined;
    }
  }

  async createEvent(event: any): Promise<any> {
    try {
      const newEvent = new Event(event);
      await newEvent.save();
      return newEvent.toObject();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: number, eventData: any): Promise<any | undefined> {
    try {
      const event = await Event.findByIdAndUpdate(id, eventData, { new: true });
      return event ? event.toObject() : undefined;
    } catch (error) {
      console.error('Error updating event:', error);
      return undefined;
    }
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      const result = await Event.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  // Gallery management
  async getGalleryItems(): Promise<any[]> {
    try {
      const galleryItems = await Gallery.find().sort({ order: 1 });
      return galleryItems.map(item => item.toObject());
    } catch (error) {
      console.error('Error getting all gallery items:', error);
      return [];
    }
  }

  async getGalleryItem(id: number): Promise<any | undefined> {
    try {
      const galleryItem = await Gallery.findById(id);
      return galleryItem ? galleryItem.toObject() : undefined;
    } catch (error) {
      console.error('Error getting gallery item by ID:', error);
      return undefined;
    }
  }

  async createGalleryItem(galleryItem: any): Promise<any> {
    try {
      const newGalleryItem = new Gallery(galleryItem);
      await newGalleryItem.save();
      return newGalleryItem.toObject();
    } catch (error) {
      console.error('Error creating gallery item:', error);
      throw error;
    }
  }

  async updateGalleryItem(id: number, galleryData: any): Promise<any | undefined> {
    try {
      const galleryItem = await Gallery.findByIdAndUpdate(id, galleryData, { new: true });
      return galleryItem ? galleryItem.toObject() : undefined;
    } catch (error) {
      console.error('Error updating gallery item:', error);
      return undefined;
    }
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    try {
      const result = await Gallery.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      return false;
    }
  }

  // Video management
  async getVideos(): Promise<any[]> {
    try {
      const videos = await Video.find().sort({ order: 1 });
      return videos.map(video => video.toObject());
    } catch (error) {
      console.error('Error getting all videos:', error);
      return [];
    }
  }

  async getVideo(id: number): Promise<any | undefined> {
    try {
      const video = await Video.findById(id);
      return video ? video.toObject() : undefined;
    } catch (error) {
      console.error('Error getting video by ID:', error);
      return undefined;
    }
  }

  async createVideo(video: any): Promise<any> {
    try {
      const newVideo = new Video(video);
      await newVideo.save();
      return newVideo.toObject();
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  async updateVideo(id: number, videoData: any): Promise<any | undefined> {
    try {
      const video = await Video.findByIdAndUpdate(id, videoData, { new: true });
      return video ? video.toObject() : undefined;
    } catch (error) {
      console.error('Error updating video:', error);
      return undefined;
    }
  }

  async deleteVideo(id: number): Promise<boolean> {
    try {
      const result = await Video.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  }

  // Testimonial management
  async getTestimonials(): Promise<any[]> {
    try {
      const testimonials = await Testimonial.find({ isActive: true });
      return testimonials.map(testimonial => testimonial.toObject());
    } catch (error) {
      console.error('Error getting all testimonials:', error);
      return [];
    }
  }

  async getTestimonial(id: number): Promise<any | undefined> {
    try {
      const testimonial = await Testimonial.findById(id);
      return testimonial ? testimonial.toObject() : undefined;
    } catch (error) {
      console.error('Error getting testimonial by ID:', error);
      return undefined;
    }
  }

  async createTestimonial(testimonial: any): Promise<any> {
    try {
      const newTestimonial = new Testimonial(testimonial);
      await newTestimonial.save();
      return newTestimonial.toObject();
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  async updateTestimonial(id: number, testimonialData: any): Promise<any | undefined> {
    try {
      const testimonial = await Testimonial.findByIdAndUpdate(id, testimonialData, { new: true });
      return testimonial ? testimonial.toObject() : undefined;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      return undefined;
    }
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    try {
      const result = await Testimonial.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return false;
    }
  }

  // Contact message management
  async getContactMessages(): Promise<any[]> {
    try {
      const messages = await ContactMessage.find().sort({ createdAt: -1 });
      return messages.map(message => message.toObject());
    } catch (error) {
      console.error('Error getting all contact messages:', error);
      return [];
    }
  }

  async getContactMessage(id: number): Promise<any | undefined> {
    try {
      const message = await ContactMessage.findById(id);
      return message ? message.toObject() : undefined;
    } catch (error) {
      console.error('Error getting contact message by ID:', error);
      return undefined;
    }
  }

  async createContactMessage(message: any): Promise<any> {
    try {
      const newMessage = new ContactMessage(message);
      await newMessage.save();
      return newMessage.toObject();
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw error;
    }
  }

  async updateContactMessage(id: number, messageData: any): Promise<any | undefined> {
    try {
      const message = await ContactMessage.findByIdAndUpdate(id, messageData, { new: true });
      return message ? message.toObject() : undefined;
    } catch (error) {
      console.error('Error updating contact message:', error);
      return undefined;
    }
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    try {
      const result = await ContactMessage.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting contact message:', error);
      return false;
    }
  }

  // Social link management
  async getSocialLinks(): Promise<any[]> {
    try {
      const links = await SocialLink.find({ isActive: true });
      return links.map(link => link.toObject());
    } catch (error) {
      console.error('Error getting all social links:', error);
      return [];
    }
  }

  async getSocialLink(id: number): Promise<any | undefined> {
    try {
      const link = await SocialLink.findById(id);
      return link ? link.toObject() : undefined;
    } catch (error) {
      console.error('Error getting social link by ID:', error);
      return undefined;
    }
  }

  async createSocialLink(link: any): Promise<any> {
    try {
      const newLink = new SocialLink(link);
      await newLink.save();
      return newLink.toObject();
    } catch (error) {
      console.error('Error creating social link:', error);
      throw error;
    }
  }

  async updateSocialLink(id: number, linkData: any): Promise<any | undefined> {
    try {
      const link = await SocialLink.findByIdAndUpdate(id, linkData, { new: true });
      return link ? link.toObject() : undefined;
    } catch (error) {
      console.error('Error updating social link:', error);
      return undefined;
    }
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    try {
      const result = await SocialLink.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting social link:', error);
      return false;
    }
  }

  // Donation management
  async getDonations(): Promise<any[]> {
    try {
      const donations = await Donation.find()
        .sort({ createdAt: -1 })
        .populate('userId')
        .populate('categoryId')
        .populate('eventId');
      return donations.map(donation => donation.toObject());
    } catch (error) {
      console.error('Error getting all donations:', error);
      return [];
    }
  }

  async getDonation(id: number): Promise<any | undefined> {
    try {
      const donation = await Donation.findById(id)
        .populate('userId')
        .populate('categoryId')
        .populate('eventId');
      return donation ? donation.toObject() : undefined;
    } catch (error) {
      console.error('Error getting donation by ID:', error);
      return undefined;
    }
  }

  async getUserDonations(userId: number): Promise<any[]> {
    try {
      const donations = await Donation.find({ userId })
        .sort({ createdAt: -1 })
        .populate('categoryId')
        .populate('eventId');
      return donations.map(donation => donation.toObject());
    } catch (error) {
      console.error('Error getting user donations:', error);
      return [];
    }
  }

  async createDonation(donation: any): Promise<any> {
    try {
      const newDonation = new Donation(donation);
      await newDonation.save();
      return newDonation.toObject();
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }

  async updateDonation(id: number, donationData: any): Promise<any | undefined> {
    try {
      const donation = await Donation.findByIdAndUpdate(id, donationData, { new: true });
      return donation ? donation.toObject() : undefined;
    } catch (error) {
      console.error('Error updating donation:', error);
      return undefined;
    }
  }

  async deleteDonation(id: number): Promise<boolean> {
    try {
      const result = await Donation.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting donation:', error);
      return false;
    }
  }

  // Subscription management
  async getSubscriptions(): Promise<any[]> {
    try {
      const subscriptions = await Subscription.find().sort({ createdAt: -1 });
      return subscriptions.map(subscription => subscription.toObject());
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      return [];
    }
  }

  async getSubscription(id: number): Promise<any | undefined> {
    try {
      const subscription = await Subscription.findById(id);
      return subscription ? subscription.toObject() : undefined;
    } catch (error) {
      console.error('Error getting subscription by ID:', error);
      return undefined;
    }
  }

  async getSubscriptionByEmail(email: string): Promise<any | undefined> {
    try {
      const subscription = await Subscription.findOne({ email });
      return subscription ? subscription.toObject() : undefined;
    } catch (error) {
      console.error('Error getting subscription by email:', error);
      return undefined;
    }
  }

  async createSubscription(subscription: any): Promise<any> {
    try {
      const newSubscription = new Subscription(subscription);
      await newSubscription.save();
      return newSubscription.toObject();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: number, subscriptionData: any): Promise<any | undefined> {
    try {
      const subscription = await Subscription.findByIdAndUpdate(id, subscriptionData, { new: true });
      return subscription ? subscription.toObject() : undefined;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return undefined;
    }
  }

  async deleteSubscription(id: number): Promise<boolean> {
    try {
      const result = await Subscription.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }
  }
}

// Export the MongoDB storage implementation
export const mongoStorage = new MongoStorage();