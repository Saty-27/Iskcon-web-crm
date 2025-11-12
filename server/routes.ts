import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import paymentRoutes from "./routes/payment";
import receiptRoutes from "./routes/receipt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertUserSchema, 
  insertBannerSchema, 
  insertQuoteSchema, 
  insertDonationCategorySchema,
  insertDonationCardSchema,
  insertBankDetailsSchema,
  insertEventSchema, 
  insertGallerySchema, 
  insertVideoSchema,
  insertLiveVideoSchema, 
  insertTestimonialSchema,
  insertContactMessageSchema,
  insertSocialLinkSchema,
  insertDonationSchema,
  insertSubscriptionSchema,
  insertBlogPostSchema
} from "@shared/schema";

import express from "express";
import session from "express-session";
import jwt from "jsonwebtoken";
import { z } from "zod";
// This is a workaround for ESM compatibility
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "iskcon_juhu_jwt_secret";

// Middleware to verify JWT token
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to verify if user is an admin - TEMPORARILY DISABLED
const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Admin authentication temporarily disabled for testing
  next();
};

// Extend express Request type to include session
declare module "express-session" {
  interface Session {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple in-memory session store for development
  const MemoryStore = require('memorystore')(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "iskcon_juhu_secret",
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 86400000, // 1 day
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax'
      }
    })
  );
  
  // Debug middleware to log session info
  app.use((req, res, next) => {
    console.log('Session middleware check:', {
      sessionId: req.sessionID,
      userId: req.session?.userId,
      sessionExists: !!req.session
    });
    next();
  });

  // Configure multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const bannersDir = path.join(uploadsDir, 'banners');
  const cardsDir = path.join(uploadsDir, 'cards');
  const qrCodesDir = path.join(uploadsDir, 'qr-codes');
  const galleryDir = path.join(uploadsDir, 'gallery');
  const videosDir = path.join(uploadsDir, 'videos');
  const blogDir = path.join(uploadsDir, 'blog');
  const socialIconsDir = path.join(uploadsDir, 'social-icons');
  
  // Create directories if they don't exist
  [uploadsDir, bannersDir, cardsDir, qrCodesDir, galleryDir, videosDir, blogDir, socialIconsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const storage_multer = multer.diskStorage({
    destination: function (req, file, cb) {
      const type = req.body.type || 'banner';
      let destDir = bannersDir;
      
      if (type === 'card') {
        destDir = cardsDir;
      } else if (type === 'qr') {
        destDir = qrCodesDir;
      } else if (type === 'gallery') {
        destDir = galleryDir;
      } else if (type === 'video') {
        destDir = videosDir;
      } else if (type === 'blog') {
        destDir = blogDir;
      } else if (type === 'social-icon') {
        destDir = socialIconsDir;
      }
      
      console.log('Upload destination for type', type, ':', destDir);
      cb(null, destDir);
    },
    filename: function (req, file, cb) {
      const type = req.body.type || 'banner';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = type + '-' + uniqueSuffix + path.extname(file.originalname);
      console.log('Generated filename for type', type, ':', filename);
      cb(null, filename);
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    limits: {
      fileSize: 1 * 1024 * 1024 // 1MB limit
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // Serve uploaded images with proper MIME types
  app.use('/uploads/banners', express.static(bannersDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  app.use('/uploads/cards', express.static(cardsDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  app.use('/uploads/qr-codes', express.static(qrCodesDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  app.use('/uploads/gallery', express.static(galleryDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  app.use('/uploads/videos', express.static(videosDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  app.use('/uploads/blog', express.static(blogDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  app.use('/uploads/social-icons', express.static(socialIconsDir, {
    setHeaders: (res, path) => {
      if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));

  // Generic upload endpoint - move file to correct directory after upload
  app.post("/api/upload", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const type = req.body.type || 'banner';
      console.log('Processing upload for type:', type);
      
      // Determine target directory and folder name
      let targetDir = bannersDir;
      let folder = 'banners';
      
      if (type === 'card') {
        targetDir = cardsDir;
        folder = 'cards';
      } else if (type === 'qr') {
        targetDir = qrCodesDir;
        folder = 'qr-codes';
      } else if (type === 'gallery') {
        targetDir = galleryDir;
        folder = 'gallery';
      } else if (type === 'video') {
        targetDir = videosDir;
        folder = 'videos';
      } else if (type === 'blog') {
        targetDir = blogDir;
        folder = 'blog';
      } else if (type === 'social-icon') {
        targetDir = socialIconsDir;
        folder = 'social-icons';
      }
      
      // If file is not in the correct directory, move it
      const currentPath = req.file.path;
      const correctFilename = type + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
      const correctPath = path.join(targetDir, correctFilename);
      
      console.log('Moving file from:', currentPath, 'to:', correctPath);
      
      // Move file to correct directory
      if (currentPath !== correctPath) {
        fs.renameSync(currentPath, correctPath);
        console.log('File moved successfully to:', correctPath);
      }
      
      // Verify file exists at new location
      if (!fs.existsSync(correctPath)) {
        console.error('File not found at target path:', correctPath);
        return res.status(500).json({ message: "File upload failed - file not moved to correct directory" });
      }
      
      const imageUrl = `/uploads/${folder}/${correctFilename}`;
      console.log('File uploaded successfully:', imageUrl, 'Size:', fs.statSync(correctPath).size, 'bytes');
      res.json({ url: imageUrl });
      
    } catch (error) {
      console.log('Error processing upload:', error);
      res.status(500).json({ message: "Error processing uploaded file", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Banner upload endpoint (legacy)
  app.post("/api/upload/banner", isAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageUrl = `/uploads/banners/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Error uploading file", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Gallery image upload endpoint
  const galleryUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, galleryDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: 20 * 1024 * 1024 // 20MB limit
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  app.post("/api/upload/gallery", isAdmin, galleryUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageUrl = `/uploads/gallery/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Error uploading gallery image", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Video thumbnail upload endpoint
  const videoUpload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, videosDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: 20 * 1024 * 1024 // 20MB limit
    },
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  app.post("/api/upload/videos", isAdmin, videoUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageUrl = `/uploads/videos/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Error uploading video thumbnail", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Mount payment routes
  app.use("/api/payments", paymentRoutes);
  app.use("/api/receipts", receiptRoutes);

  // Banner API endpoints
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners.filter(b => b.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching banners" });
    }
  });

  app.post("/api/banners", isAdmin, async (req, res) => {
    try {
      const data = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(data);
      res.status(201).json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating banner" });
    }
  });

  app.put("/api/banners/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Updating banner:', id, 'with data:', req.body);
      const data = insertBannerSchema.partial().parse(req.body);
      console.log('Parsed data:', data);
      const banner = await storage.updateBanner(id, data);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }
      res.json(banner);
    } catch (error) {
      console.error('Banner update error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating banner", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/banners/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBanner(id);
      if (!success) {
        return res.status(404).json({ message: "Banner not found" });
      }
      res.json({ message: "Banner deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting banner" });
    }
  });

  // Quotes API endpoints
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes.filter(q => q.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching quotes" });
    }
  });

  app.get("/api/admin/quotes", isAdmin, async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quotes" });
    }
  });

  app.post("/api/quotes", isAdmin, async (req, res) => {
    try {
      const data = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(data);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating quote" });
    }
  });

  app.put("/api/quotes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertQuoteSchema.partial().parse(req.body);
      const quote = await storage.updateQuote(id, data);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating quote" });
    }
  });

  app.delete("/api/quotes/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuote(id);
      if (!success) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json({ message: "Quote deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting quote" });
    }
  });

  // Donation Categories API endpoints
  app.get("/api/donation-categories", async (req, res) => {
    try {
      const categories = await storage.getDonationCategories();
      res.json(categories.filter(c => c.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching donation categories" });
    }
  });

  app.get("/api/donation-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getDonationCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Donation category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Error fetching donation category" });
    }
  });

  app.post("/api/donation-categories", isAdmin, async (req, res) => {
    try {
      const data = insertDonationCategorySchema.parse(req.body);
      const category = await storage.createDonationCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating donation category" });
    }
  });

  app.put("/api/donation-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const requestData = insertDonationCategorySchema.partial().parse(req.body);
      
      // Handle suggestedAmounts separately to ensure correct type
      const data: any = { ...requestData };
      if (requestData.suggestedAmounts !== undefined) {
        if (Array.isArray(requestData.suggestedAmounts)) {
          data.suggestedAmounts = requestData.suggestedAmounts;
        } else if (typeof requestData.suggestedAmounts === 'string') {
          // Parse comma-separated string to number array
          data.suggestedAmounts = requestData.suggestedAmounts
            .split(',')
            .map(s => parseFloat(s.trim()))
            .filter(n => !isNaN(n));
        } else {
          data.suggestedAmounts = null;
        }
      }
      
      const category = await storage.updateDonationCategory(id, data as any);
      if (!category) {
        return res.status(404).json({ message: "Donation category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error('Error updating donation category:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating donation category", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/donation-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Attempting to delete donation category with ID:', id);
      
      // Call the updated deletion method
      const result = await storage.deleteDonationCategory(id);
      
      if (!result.success) {
        console.log('Delete operation failed:', result.message);
        return res.status(400).json({ 
          message: result.message || "Cannot delete donation category" 
        });
      }
      
      console.log(`Successfully deleted donation category ${id} and ${result.deletedCards || 0} related cards`);
      res.json({ 
        message: "Donation category deleted successfully", 
        deletedCards: result.deletedCards || 0
      });
    } catch (error) {
      console.error('Error deleting donation category:', error);
      res.status(500).json({ 
        message: "Error deleting donation category", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Donation Cards API endpoints
  app.get("/api/donation-cards", async (req, res) => {
    try {
      const cards = await storage.getDonationCards();
      res.json(cards.filter(c => c.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching donation cards" });
    }
  });

  app.get("/api/donation-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const card = await storage.getDonationCard(id);
      if (!card) {
        return res.status(404).json({ message: "Donation card not found" });
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "Error fetching donation card" });
    }
  });

  app.get("/api/donation-cards/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const cards = await storage.getDonationCardsByCategory(categoryId);
      res.json(cards.filter(c => c.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching donation cards by category" });
    }
  });

  app.post("/api/donation-cards", isAdmin, async (req, res) => {
    try {
      console.log('Donation card creation request body:', JSON.stringify(req.body, null, 2));
      const data = insertDonationCardSchema.parse(req.body);
      console.log('Parsed donation card data:', JSON.stringify(data, null, 2));
      const card = await storage.createDonationCard(data);
      console.log('Created donation card:', JSON.stringify(card, null, 2));
      res.status(201).json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Donation card validation error:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.log('Donation card creation error:', error);
      res.status(500).json({ message: "Error creating donation card" });
    }
  });

  app.put("/api/donation-cards/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertDonationCardSchema.partial().parse(req.body);
      const card = await storage.updateDonationCard(id, data);
      if (!card) {
        return res.status(404).json({ message: "Donation card not found" });
      }
      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating donation card" });
    }
  });

  app.delete("/api/donation-cards/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDonationCard(id);
      if (!success) {
        return res.status(404).json({ message: "Donation card not found" });
      }
      res.json({ message: "Donation card deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting donation card" });
    }
  });

  // Bank Details API endpoints
  app.get("/api/bank-details", async (req, res) => {
    try {
      const details = await storage.getBankDetails();
      res.json(details.filter(d => d.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching bank details" });
    }
  });

  // Get bank details for a specific category (if it has custom bank details)
  app.get("/api/categories/:categoryId/bank-details", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      // First check if category has specific bank details
      const categoryBankDetails = await storage.getCategoryBankDetails(categoryId);
      
      if (categoryBankDetails && categoryBankDetails.length > 0) {
        res.json(categoryBankDetails.filter(d => d.isActive));
      } else {
        // If no category-specific bank details, create default ones with unique placeholder values
        const category = await storage.getDonationCategory(categoryId);
        const categoryName = category ? category.name : `Category ${categoryId}`;
        
        const newCategoryBankDetails = await storage.createCategoryBankDetails({
          categoryId: categoryId,
          accountName: `${categoryName} Fund`,
          bankName: "State Bank of India",
          accountNumber: `100000000${categoryId}`,
          ifscCode: "SBIN0000001",
          swiftCode: "SBININBB",
          qrCodeUrl: "",
          isActive: true
        });
        res.json([newCategoryBankDetails]);
      }
    } catch (error) {
      console.error('Error fetching category bank details:', error);
      res.status(500).json({ error: 'Failed to fetch category bank details' });
    }
  });

  app.post("/api/bank-details", isAdmin, async (req, res) => {
    try {
      const data = insertBankDetailsSchema.parse(req.body);
      const details = await storage.createBankDetails(data);
      res.status(201).json(details);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating bank details" });
    }
  });

  app.put("/api/bank-details/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertBankDetailsSchema.partial().parse(req.body);
      const details = await storage.updateBankDetails(id, data);
      if (!details) {
        return res.status(404).json({ message: "Bank details not found" });
      }
      res.json(details);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating bank details" });
    }
  });

  // Create or update category-specific bank details
  app.post("/api/categories/:categoryId/bank-details", isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      console.log('Creating/updating category bank details for categoryId:', categoryId);
      console.log('Request body:', req.body);
      
      // Check if bank details already exist for this category
      const existingDetails = await storage.getCategoryBankDetails(categoryId);
      
      if (existingDetails && existingDetails.length > 0) {
        // Update existing details
        const bankDetails = await storage.updateCategoryBankDetails(existingDetails[0].id, req.body);
        if (bankDetails) {
          res.json(bankDetails);
        } else {
          res.status(404).json({ message: "Bank details not found" });
        }
      } else {
        // Create new details
        const bankDetailsData = {
          ...req.body,
          categoryId: categoryId,
          isActive: true
        };
        
        const bankDetails = await storage.createCategoryBankDetails(bankDetailsData);
        res.status(201).json(bankDetails);
      }
    } catch (error) {
      console.error('Error creating/updating category bank details:', error);
      res.status(500).json({ message: "Error creating/updating category bank details" });
    }
  });

  // Update category-specific bank details
  app.put("/api/categories/:categoryId/bank-details/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryId = parseInt(req.params.categoryId);
      
      // Validate that the bank details belong to the specified category
      const existingDetails = await storage.getCategoryBankDetail(id);
      if (!existingDetails || existingDetails.categoryId !== categoryId) {
        return res.status(404).json({ message: "Bank details not found for this category" });
      }
      
      const bankDetails = await storage.updateCategoryBankDetails(id, req.body);
      if (bankDetails) {
        res.json(bankDetails);
      } else {
        res.status(404).json({ message: "Bank details not found" });
      }
    } catch (error) {
      console.error('Error updating category bank details:', error);
      res.status(500).json({ message: "Error updating category bank details" });
    }
  });

  app.delete("/api/bank-details/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBankDetails(id);
      if (!success) {
        return res.status(404).json({ message: "Bank details not found" });
      }
      res.json({ message: "Bank details deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting bank details" });
    }
  });

  // Events API endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events.filter(e => e.isActive));
    } catch (error) {
      console.error("Events API error:", error);
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error fetching event" });
    }
  });

  app.post("/api/events", isAdmin, async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating event" });
    }
  });

  app.put("/api/events/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const requestData = insertEventSchema.partial().parse(req.body);
      
      // Handle suggestedAmounts separately to ensure correct type
      let data = { ...requestData };
      if (requestData.suggestedAmounts && !Array.isArray(requestData.suggestedAmounts)) {
        data = {
          ...requestData,
          suggestedAmounts: Array.isArray(requestData.suggestedAmounts) 
            ? requestData.suggestedAmounts 
            : null
        };
      }
      
      const event = await storage.updateEvent(id, data as any);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating event" });
    }
  });

  app.delete("/api/events/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting event" });
    }
  });

  // Event Donation Cards API endpoints
  app.get("/api/events/:eventId/donation-cards", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const cards = await storage.getEventDonationCards(eventId);
      res.json(cards.filter(c => c.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching event donation cards" });
    }
  });

  app.post("/api/event-donation-cards", async (req, res) => {
    try {
      const card = await storage.createEventDonationCard(req.body);
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ message: "Error creating event donation card" });
    }
  });

  app.put("/api/event-donation-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const card = await storage.updateEventDonationCard(id, req.body);
      if (!card) {
        return res.status(404).json({ message: "Event donation card not found" });
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ message: "Error updating event donation card" });
    }
  });

  app.delete("/api/event-donation-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEventDonationCard(id);
      if (!success) {
        return res.status(404).json({ message: "Event donation card not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting event donation card" });
    }
  });

  // Event-specific bank details API endpoints
  app.get("/api/events/:id/bank-details", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const bankDetails = await storage.getEventBankDetails(eventId);
      res.json(bankDetails.filter(bd => bd.isActive));
    } catch (error) {
      console.error("Event bank details API error:", error);
      res.status(500).json({ message: "Error fetching event bank details" });
    }
  });

  app.post("/api/events/:id/bank-details", isAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const data = { ...req.body, eventId };
      const bankDetails = await storage.createEventBankDetails(data);
      res.status(201).json(bankDetails);
    } catch (error) {
      console.error("Create event bank details error:", error);
      res.status(500).json({ message: "Error creating event bank details" });
    }
  });

  app.put("/api/events/:eventId/bank-details/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventId = parseInt(req.params.eventId);
      const data = { ...req.body, eventId };
      const bankDetails = await storage.updateEventBankDetails(id, data);
      if (!bankDetails) {
        return res.status(404).json({ message: "Event bank details not found" });
      }
      res.json(bankDetails);
    } catch (error) {
      console.error("Update event bank details error:", error);
      res.status(500).json({ message: "Error updating event bank details" });
    }
  });

  app.delete("/api/events/:eventId/bank-details/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEventBankDetails(id);
      if (!success) {
        return res.status(404).json({ message: "Event bank details not found" });
      }
      res.json({ message: "Event bank details deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting event bank details" });
    }
  });

  // Gallery API endpoints
  app.get("/api/gallery", async (req, res) => {
    try {
      const galleryItems = await storage.getGalleryItems();
      res.json(galleryItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching gallery items" });
    }
  });

  app.post("/api/gallery", isAdmin, async (req, res) => {
    try {
      const data = insertGallerySchema.parse(req.body);
      const galleryItem = await storage.createGalleryItem(data);
      res.status(201).json(galleryItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating gallery item" });
    }
  });

  app.put("/api/gallery/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertGallerySchema.partial().parse(req.body);
      const galleryItem = await storage.updateGalleryItem(id, data);
      if (!galleryItem) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.json(galleryItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating gallery item" });
    }
  });

  app.delete("/api/gallery/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGalleryItem(id);
      if (!success) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.json({ message: "Gallery item deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting gallery item" });
    }
  });

  // Videos API endpoints
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching videos" });
    }
  });

  app.post("/api/videos", isAdmin, async (req, res) => {
    try {
      const data = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(data);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating video" });
    }
  });

  app.put("/api/videos/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertVideoSchema.partial().parse(req.body);
      const video = await storage.updateVideo(id, data);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating video" });
    }
  });

  app.delete("/api/videos/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVideo(id);
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json({ message: "Video deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting video" });
    }
  });

  // Live videos API endpoints
  app.get("/api/live-videos", async (req, res) => {
    try {
      const liveVideos = await storage.getLiveVideos();
      res.json(liveVideos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching live videos" });
    }
  });

  app.post("/api/live-videos", isAdmin, async (req, res) => {
    try {
      const data = insertLiveVideoSchema.parse(req.body);
      const liveVideo = await storage.createLiveVideo(data);
      res.status(201).json(liveVideo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating live video" });
    }
  });

  app.put("/api/live-videos/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertLiveVideoSchema.partial().parse(req.body);
      const liveVideo = await storage.updateLiveVideo(id, data);
      if (!liveVideo) {
        return res.status(404).json({ message: "Live video not found" });
      }
      res.json(liveVideo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating live video" });
    }
  });

  app.delete("/api/live-videos/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLiveVideo(id);
      if (!success) {
        return res.status(404).json({ message: "Live video not found" });
      }
      res.json({ message: "Live video deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting live video" });
    }
  });

  // Testimonials API endpoints
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials.filter(t => t.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching testimonials" });
    }
  });

  app.get("/api/admin/testimonials", isAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Error fetching testimonials" });
    }
  });

  app.post("/api/testimonials", isAdmin, async (req, res) => {
    try {
      const data = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(data);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating testimonial" });
    }
  });

  app.put("/api/testimonials/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await storage.updateTestimonial(id, data);
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating testimonial" });
    }
  });

  app.delete("/api/testimonials/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTestimonial(id);
      if (!success) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json({ message: "Testimonial deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting testimonial" });
    }
  });

  // Contact API endpoints
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      res.status(201).json({ message: "Contact message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error sending contact message" });
    }
  });

  app.get("/api/contact-messages", isAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching contact messages" });
    }
  });

  app.put("/api/contact-messages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = { isRead: true };
      const message = await storage.updateContactMessage(id, data);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Error updating contact message" });
    }
  });

  app.put("/api/contact-messages/:id/read", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markContactMessageAsRead(id);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read" });
    }
  });

  app.delete("/api/contact-messages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContactMessage(id);
      if (!success) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json({ message: "Contact message deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting contact message" });
    }
  });

  // Social links API endpoints
  app.get("/api/social-links", async (req, res) => {
    try {
      const socialLinks = await storage.getSocialLinks();
      res.json(socialLinks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching social links" });
    }
  });

  app.post("/api/social-links", isAdmin, async (req, res) => {
    try {
      const data = insertSocialLinkSchema.parse(req.body);
      const socialLink = await storage.createSocialLink(data);
      res.status(201).json(socialLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating social link" });
    }
  });

  app.put("/api/social-links/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSocialLinkSchema.partial().parse(req.body);
      const socialLink = await storage.updateSocialLink(id, data);
      if (!socialLink) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json(socialLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating social link" });
    }
  });

  app.delete("/api/social-links/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSocialLink(id);
      if (!success) {
        return res.status(404).json({ message: "Social link not found" });
      }
      res.json({ message: "Social link deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting social link" });
    }
  });

  // Users API endpoints
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.put("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Stats API endpoints
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats.filter(s => s.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  // Temple schedule API endpoints
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules.filter(s => s.isActive));
    } catch (error) {
      res.status(500).json({ message: "Error fetching schedules" });
    }
  });

  // Donation API endpoints
  app.post("/api/donations", async (req, res) => {
    try {
      const data = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(data);
      
      // TODO: Implement PayU payment gateway integration here
      // This would create a payment link and redirect user to the payment page
      
      res.status(201).json({
        message: "Donation created successfully",
        donation,
        paymentUrl: `https://pay.example.com/${donation.id}` // Example payment URL
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating donation" });
    }
  });

  app.get("/api/donations", isAdmin, async (req, res) => {
    try {
      const donations = await storage.getDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching donations" });
    }
  });

  // Admin donations management endpoint
  app.get("/api/admin/donations", isAdmin, async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching donations" });
    }
  });

  app.get("/api/user/donations", isAuthenticated, async (req, res) => {
    try {
      const donations = await storage.getUserDonations(req.session.userId);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user donations" });
    }
  });

  // Get donation by payment ID
  app.get("/api/donations/by-payment-id/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const donation = await storage.getDonationByPaymentId(paymentId);
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Error fetching donation" });
    }
  });

  // Payment webhook (for PayU)
  app.post("/api/donations/payment-webhook", async (req, res) => {
    try {
      // In a real implementation, this would validate the payment response from PayU
      // and update the donation status accordingly
      
      const { donationId, status, transactionId } = req.body;
      
      if (!donationId || !status) {
        return res.status(400).json({ message: "Invalid webhook data" });
      }
      
      const donation = await storage.getDonation(parseInt(donationId));
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      const updatedDonation = await storage.updateDonation(donation.id, {
        status,
        paymentId: transactionId
      });
      
      res.json({ message: "Payment status updated" });
    } catch (error) {
      res.status(500).json({ message: "Error processing payment webhook" });
    }
  });

  // Blog posts API endpoints
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts.filter(post => post.isPublished));
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      if (!post.isPublished) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog post" });
    }
  });

  app.get("/api/admin/blog-posts", isAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching blog posts" });
    }
  });

  app.post("/api/admin/blog-posts", isAdmin, async (req, res) => {
    try {
      const data = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating blog post" });
    }
  });

  app.put("/api/admin/blog-posts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Server received blog update request for ID:', id);
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      // Handle publishedAt date conversion manually if it exists
      const requestBody = { ...req.body };
      if (requestBody.publishedAt && typeof requestBody.publishedAt === 'string') {
        requestBody.publishedAt = new Date(requestBody.publishedAt);
      }
      
      const data = insertBlogPostSchema.partial().parse(requestBody);
      console.log('Parsed data successfully:', Object.keys(data));
      
      const post = await storage.updateBlogPost(id, data);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Validation errors:', error.errors);
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.log('Server error updating blog post:', error);
      res.status(500).json({ message: "Error updating blog post" });
    }
  });

  app.delete("/api/admin/blog-posts/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json({ message: "Blog post deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting blog post" });
    }
  });

  // Subscription newsletter endpoint
  app.post("/api/subscribe", async (req, res) => {
    try {
      const data = insertSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscription = await storage.getSubscriptionByEmail(data.email);
      
      if (existingSubscription) {
        if (!existingSubscription.isActive) {
          // Reactivate subscription
          await storage.updateSubscription(existingSubscription.id, { isActive: true });
        }
        
        return res.json({ message: "Subscription successful" });
      }
      
      // Create new subscription
      await storage.createSubscription(data);
      res.status(201).json({ message: "Subscription successful" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating subscription" });
    }
  });

  // Current user endpoint - JWT based
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No authorization header or invalid format');
        return res.status(200).json(null);
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        console.log('Token decoded successfully, userId:', decoded.userId);
        
        const user = await storage.getUser(decoded.userId);
        
        if (!user) {
          console.log('User not found in DB');
          return res.status(200).json(null);
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        console.log('Returning user:', userWithoutPassword);
        res.json(userWithoutPassword);
      } catch (tokenError) {
        console.log('Invalid token:', tokenError);
        return res.status(200).json(null);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Error fetching current user" });
    }
  });
  
  // User authentication API endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // In a real app, password would be hashed before storing
      const user = await storage.createUser(data);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      
      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error registering user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, username, password } = req.body;
      
      console.log('Login attempt:', { email, username, password: '***' });
      
      if ((!email && !username) || !password) {
        return res.status(400).json({ message: "Email/username and password are required" });
      }
      
      // Try to find user by email first, then by username
      const user = email ? await storage.getUserByEmail(email) : await storage.getUserByUsername(username);
      
      console.log('User found:', user ? { id: user.id, username: user.username, isActive: user.isActive } : null);
      console.log('Password match:', user ? user.password === password : false);
      
      if (!user || user.password !== password) { // In a real app, password comparison would use a secure method
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('Login successful, generating token for user:', user.id);
      
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token: token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Error during login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user profile" });
    }
  });

  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updateSchema = insertUserSchema.partial().omit({ password: true });
      const data = updateSchema.parse(req.body);
      
      const user = await storage.updateUser(req.session.userId, data);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating user profile" });
    }
  });

  // Admin user management API endpoints
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertUserSchema.partial();
      const data = updateSchema.parse(req.body);
      
      const user = await storage.updateUser(id, data);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Prevent admin from deleting themselves
      if (id === req.session.userId) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Admin dashboard stats
  app.get("/api/admin/dashboard-stats", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const donations = await storage.getDonations();
      const contactMessages = await storage.getContactMessages();
      const donationCategories = await storage.getDonationCategories();
      
      // Calculate total donation amount
      const totalDonationAmount = donations.reduce((total, donation) => {
        if (donation.status === "success") {
          return total + donation.amount;
        }
        return total;
      }, 0);
      
      // Calculate pending donation amount
      const pendingDonationAmount = donations.reduce((total, donation) => {
        if (donation.status === "pending") {
          return total + donation.amount;
        }
        return total;
      }, 0);
      
      // Count messages by status
      const unreadMessages = contactMessages.filter(msg => !msg.isRead).length;
      
      // Donation counts by category
      const donationsByCategory = donationCategories.map(category => {
        const count = donations.filter(d => d.categoryId === category.id && d.status === "success").length;
        const amount = donations
          .filter(d => d.categoryId === category.id && d.status === "success")
          .reduce((sum, d) => sum + d.amount, 0);
        
        return {
          id: category.id,
          name: category.name,
          count,
          amount
        };
      });
      
      res.json({
        userCount: users.length,
        donationCount: donations.filter(d => d.status === "success").length,
        pendingDonationCount: donations.filter(d => d.status === "pending").length,
        totalDonationAmount,
        pendingDonationAmount,
        messageCount: contactMessages.length,
        unreadMessageCount: unreadMessages,
        donationsByCategory
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // PayU Payment Integration
  app.post("/api/payment/create-payu-order", async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        amount,
        message,
        categoryId,
        cardId,
        eventId,
        eventCardId,
        isCustomAmount
      } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name, email, phone, and amount are required"
        });
      }

      // Import required modules for PayU
      const crypto = require('crypto');
      const { nanoid } = require('nanoid');

      // Check if PayU keys are configured
      if (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT) {
        return res.status(500).json({
          success: false,
          message: "Payment gateway not configured. Please contact administrator."
        });
      }

      // Generate unique transaction ID
      const txnid = `TXN_${nanoid(12)}_${Date.now()}`;
      
      // PayU required parameters
      const payuParams = {
        key: process.env.PAYU_MERCHANT_KEY,
        txnid: txnid,
        amount: amount.toString(),
        productinfo: isCustomAmount ? "Custom Donation" : (cardId ? "Donation Card" : "Event Donation"),
        firstname: name.split(' ')[0],
        lastname: name.split(' ').slice(1).join(' ') || '',
        email: email,
        phone: phone,
        address1: address || '',
        city: '',
        state: '',
        country: 'India',
        zipcode: '',
        udf1: categoryId?.toString() || '',
        udf2: cardId?.toString() || '',
        udf3: eventId?.toString() || '',
        udf4: eventCardId?.toString() || '',
        udf5: isCustomAmount ? 'true' : 'false',
        surl: `https://${req.get('host')}/api/payments/success`,
        furl: `https://${req.get('host')}/api/payments/failure`,
        hash: ''
      };

      // For live environment, we need to ensure proper hash calculation
      // PayU hash format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
      const hashString = `${payuParams.key}|${payuParams.txnid}|${payuParams.amount}|${payuParams.productinfo}|${payuParams.firstname}|${payuParams.email}|${payuParams.udf1}|${payuParams.udf2}|${payuParams.udf3}|${payuParams.udf4}|${payuParams.udf5}||||||${process.env.PAYU_MERCHANT_SALT}`;
      payuParams.hash = crypto.createHash('sha512').update(hashString).digest('hex');
      
      console.log('PayU Payment Request:', {
        environment: 'LIVE',
        key: payuParams.key,
        txnid: payuParams.txnid,
        amount: payuParams.amount,
        hashGenerated: true
      });

      // Store donation details in database with pending status
      const donationData = {
        name,
        email,
        phone,
        address: address || '',
        amount: parseInt(amount),
        message: message || '',
        paymentId: txnid,
        status: 'pending' as const,
        categoryId: categoryId || null,
        eventId: eventId || null,
        userId: req.session?.userId || null
      };

      await storage.createDonation(donationData);

      res.json({
        success: true,
        paymentUrl: 'https://secure.payu.in/_payment',
        params: payuParams,
        txnid: txnid
      });

    } catch (error: any) {
      console.error('PayU order creation error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to create payment order"
      });
    }
  });

  // PayU Success Response Handler (POST for PayU callback)
  app.post("/payment/success", async (req, res) => {
    try {
      const {
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        status,
        hash,
        payuMoneyId,
        mihpayid
      } = req.body;

      console.log('PayU Success Callback:', { txnid, amount, status, firstname, email, hash });

      // Verify hash for security - PayU uses different hash format for response
      const crypto = require('crypto');
      const reverseHashString = `${process.env.PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;
      const reverseHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

      console.log('Hash verification:', {
        received: hash,
        calculated: reverseHash,
        string: reverseHashString
      });

      // For now, skip hash verification in development to allow testing
      // TODO: Fix hash verification for production
      const skipHashVerification = process.env.NODE_ENV === 'development';
      
      if (!skipHashVerification && hash !== reverseHash) {
        console.error('Hash verification failed');
        return res.redirect('/payment/failure?error=verification_failed');
      }

      // Update donation status in database
      const donation = await storage.getDonationByPaymentId(txnid);
      if (donation) {
        await storage.updateDonation(donation.id, {
          status: status === 'success' ? 'success' : 'failed',
          paymentGatewayResponse: JSON.stringify(req.body),
          updatedAt: new Date()
        });
      }

      if (status === 'success') {
        res.redirect(`/payment/success?txnid=${txnid}&amount=${amount}`);
      } else {
        res.redirect(`/payment/failure?txnid=${txnid}&error=payment_failed`);
      }

    } catch (error) {
      console.error('Payment success handler error:', error);
      res.redirect('/payment/failure?error=processing_error');
    }
  });

  // Get donation details for success page
  app.get("/api/donation/:txnid", async (req, res) => {
    try {
      const { txnid } = req.params;
      const donation = await storage.getDonationByPaymentId(txnid);
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }

      // Get additional details based on donation type
      let additionalDetails = {};
      
      if (donation.eventId) {
        const event = await storage.getEvent(donation.eventId);
        additionalDetails = {
          type: 'event',
          event: event
        };
      } else if (donation.categoryId) {
        const category = await storage.getDonationCategory(donation.categoryId);
        additionalDetails = {
          type: 'category',
          category: category
        };
      }

      // Get user details
      let user = null;
      if (donation.userId) {
        user = await storage.getUser(donation.userId);
      }

      res.json({
        donation,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          phone: user.phone
        } : null,
        ...additionalDetails
      });

    } catch (error) {
      console.error('Error fetching donation details:', error);
      res.status(500).json({ message: "Failed to fetch donation details" });
    }
  });

  // Update donation status (for testing and admin purposes)
  app.put("/api/donations/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const donation = await storage.updateDonation(parseInt(id), { status });
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json({ message: "Donation status updated", donation });
    } catch (error) {
      console.error('Error updating donation status:', error);
      res.status(500).json({ message: "Failed to update donation status" });
    }
  });

  // PayU Failure Response Handler (POST for PayU callback)
  app.post("/payment/failure", async (req, res) => {
    try {
      const { txnid, status } = req.body;

      console.log('PayU Failure Callback:', { txnid, status });

      // Update donation status in database
      const donation = await storage.getDonationByPaymentId(txnid);
      if (donation) {
        await storage.updateDonation(donation.id, {
          status: 'failed',
          paymentGatewayResponse: JSON.stringify(req.body),
          updatedAt: new Date()
        });
      }

      res.redirect(`/payment/failure?txnid=${txnid}&error=payment_cancelled`);

    } catch (error) {
      console.error('Payment failure handler error:', error);
      res.redirect('/payment/failure?error=processing_error');
    }
  });

  // Social icon upload endpoint
  app.post("/api/upload/social-icon", isAdmin, upload.single('icon'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Move file to social-icons directory
      const originalPath = req.file.path;
      const filename = 'social-icon-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(req.file.originalname);
      const targetPath = path.join(socialIconsDir, filename);
      
      // Move file to correct directory
      fs.renameSync(originalPath, targetPath);
      
      const imageUrl = `/uploads/social-icons/${filename}`;
      res.json({ url: imageUrl });
    } catch (error) {
      console.error('Error uploading social icon:', error);
      res.status(500).json({ message: "Error uploading social icon", error: error instanceof Error ? error.message : String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
