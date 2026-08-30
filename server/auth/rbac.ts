import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';

// Complete dictionary of available permissions for Super Admin to assign
export interface PermissionDefinition {
  key: string;
  name: string;
  description: string;
  section: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'reply' | 'manage';
}

export const ADMIN_SECTIONS = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'donations', name: 'Donations & Receipts' },
  { id: 'categories', name: 'Donation Categories' },
  { id: 'events', name: 'Events & Festivals' },
  { id: 'banners', name: 'Hero Banners' },
  { id: 'gallery', name: 'Temple Gallery' },
  { id: 'videos', name: 'Video Library' },
  { id: 'live_videos', name: 'Live Video Streams' },
  { id: 'quotes', name: 'Spiritual Quotes' },
  { id: 'blog', name: 'Blog Management' },
  { id: 'users', name: 'Registered Users' },
  { id: 'messages', name: 'Contact Inquiries' },
  { id: 'testimonials', name: 'Testimonials' },
  { id: 'social_links', name: 'Social Links & Settings' },
  { id: 'chat', name: 'Live Support Chat' },
  { id: 'admin_users', name: 'Staff Management (Super Admin)' },
  { id: 'audit_logs', name: 'Security Audit Logs' },
] as const;

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Dashboard
  { key: 'dashboard.view', name: 'View Dashboard', description: 'Access dashboard analytics and summary metrics', section: 'dashboard', action: 'view' },

  // Donations
  { key: 'donations.view', name: 'View Donations', description: 'View donation transactions and receipts', section: 'donations', action: 'view' },
  { key: 'donations.create', name: 'Record Donation', description: 'Manually create or import offline donations', section: 'donations', action: 'create' },
  { key: 'donations.edit', name: 'Edit Donation', description: 'Update donation metadata and donor info', section: 'donations', action: 'edit' },
  { key: 'donations.delete', name: 'Delete Donation', description: 'Delete donation transaction records', section: 'donations', action: 'delete' },

  // Donation Categories
  { key: 'categories.view', name: 'View Categories', description: 'View donation cause categories', section: 'categories', action: 'view' },
  { key: 'categories.create', name: 'Create Category', description: 'Add new donation causes and funds', section: 'categories', action: 'create' },
  { key: 'categories.edit', name: 'Edit Category', description: 'Modify donation causes, targets, and images', section: 'categories', action: 'edit' },
  { key: 'categories.delete', name: 'Delete Category', description: 'Remove donation categories', section: 'categories', action: 'delete' },

  // Events
  { key: 'events.view', name: 'View Events', description: 'View temple festivals and upcoming events', section: 'events', action: 'view' },
  { key: 'events.create', name: 'Create Event', description: 'Publish new temple festivals and events', section: 'events', action: 'create' },
  { key: 'events.edit', name: 'Edit Event', description: 'Update event schedules and banners', section: 'events', action: 'edit' },
  { key: 'events.delete', name: 'Delete Event', description: 'Delete event records', section: 'events', action: 'delete' },

  // Banners
  { key: 'banners.view', name: 'View Banners', description: 'View homepage sliders and banners', section: 'banners', action: 'view' },
  { key: 'banners.create', name: 'Upload Banner', description: 'Create and publish hero banners', section: 'banners', action: 'create' },
  { key: 'banners.edit', name: 'Edit Banner', description: 'Update banner links and display order', section: 'banners', action: 'edit' },
  { key: 'banners.delete', name: 'Delete Banner', description: 'Remove hero banners', section: 'banners', action: 'delete' },

  // Gallery
  { key: 'gallery.view', name: 'View Gallery', description: 'Browse photo albums and media', section: 'gallery', action: 'view' },
  { key: 'gallery.create', name: 'Upload Photos', description: 'Upload new images to the temple gallery', section: 'gallery', action: 'create' },
  { key: 'gallery.edit', name: 'Edit Photos', description: 'Edit titles and gallery categories', section: 'gallery', action: 'edit' },
  { key: 'gallery.delete', name: 'Delete Photos', description: 'Delete images from the gallery', section: 'gallery', action: 'delete' },

  // Videos
  { key: 'videos.view', name: 'View Videos', description: 'View video library recordings', section: 'videos', action: 'view' },
  { key: 'videos.create', name: 'Add Video', description: 'Add new YouTube / Vimeo videos', section: 'videos', action: 'create' },
  { key: 'videos.edit', name: 'Edit Video', description: 'Update video details and thumbnails', section: 'videos', action: 'edit' },
  { key: 'videos.delete', name: 'Delete Video', description: 'Remove videos from library', section: 'videos', action: 'delete' },

  // Live Videos
  { key: 'live_videos.view', name: 'View Live Streams', description: 'View live darshan configuration', section: 'live_videos', action: 'view' },
  { key: 'live_videos.create', name: 'Add Live Stream', description: 'Configure new live stream broadcasts', section: 'live_videos', action: 'create' },
  { key: 'live_videos.edit', name: 'Edit Live Stream', description: 'Update live video URLs and status', section: 'live_videos', action: 'edit' },
  { key: 'live_videos.delete', name: 'Delete Live Stream', description: 'Remove live stream configurations', section: 'live_videos', action: 'delete' },

  // Quotes
  { key: 'quotes.view', name: 'View Quotes', description: 'View daily spiritual quotes', section: 'quotes', action: 'view' },
  { key: 'quotes.create', name: 'Create Quote', description: 'Publish spiritual quotes', section: 'quotes', action: 'create' },
  { key: 'quotes.edit', name: 'Edit Quote', description: 'Update quote text and source', section: 'quotes', action: 'edit' },
  { key: 'quotes.delete', name: 'Delete Quote', description: 'Delete quotes', section: 'quotes', action: 'delete' },

  // Blog
  { key: 'blog.view', name: 'View Blogs', description: 'View blog posts and articles', section: 'blog', action: 'view' },
  { key: 'blog.create', name: 'Create Blog', description: 'Publish new blog posts and articles', section: 'blog', action: 'create' },
  { key: 'blog.edit', name: 'Edit Blog', description: 'Update blog content, tags, and SEO metadata', section: 'blog', action: 'edit' },
  { key: 'blog.delete', name: 'Delete Blog', description: 'Delete blog articles', section: 'blog', action: 'delete' },

  // Users
  { key: 'users.view', name: 'View Devotees', description: 'View registered users and donor profiles', section: 'users', action: 'view' },
  { key: 'users.create', name: 'Create Devotee', description: 'Manually register a user account', section: 'users', action: 'create' },
  { key: 'users.edit', name: 'Edit Devotee', description: 'Update user profiles, phones, and addresses', section: 'users', action: 'edit' },
  { key: 'users.delete', name: 'Delete Devotee', description: 'Deactivate or remove devotee accounts', section: 'users', action: 'delete' },

  // Messages / Contact
  { key: 'messages.view', name: 'View Inquiries', description: 'View incoming contact messages and feedback', section: 'messages', action: 'view' },
  { key: 'messages.delete', name: 'Delete Inquiries', description: 'Delete resolved contact messages', section: 'messages', action: 'delete' },

  // Testimonials
  { key: 'testimonials.view', name: 'View Testimonials', description: 'View devotee reviews and testimonials', section: 'testimonials', action: 'view' },
  { key: 'testimonials.create', name: 'Create Testimonial', description: 'Add new devotee testimonials', section: 'testimonials', action: 'create' },
  { key: 'testimonials.edit', name: 'Edit Testimonial', description: 'Update testimonial text and author', section: 'testimonials', action: 'edit' },
  { key: 'testimonials.delete', name: 'Delete Testimonial', description: 'Remove testimonials', section: 'testimonials', action: 'delete' },

  // Social Links
  { key: 'social_links.view', name: 'View Settings', description: 'View social links, temple schedule, and settings', section: 'social_links', action: 'view' },
  { key: 'social_links.create', name: 'Create Social Link', description: 'Add social platform links', section: 'social_links', action: 'create' },
  { key: 'social_links.edit', name: 'Edit Settings', description: 'Update temple schedule, bank details, and social links', section: 'social_links', action: 'edit' },
  { key: 'social_links.delete', name: 'Delete Social Link', description: 'Remove social links', section: 'social_links', action: 'delete' },

  // Real-time Chat
  { key: 'chat.view', name: 'View Live Chat', description: 'Open admin chat desk and view devotee conversations', section: 'chat', action: 'view' },
  { key: 'chat.reply', name: 'Reply in Chat', description: 'Send live replies and documents to devotees', section: 'chat', action: 'reply' },
  { key: 'chat.manage', name: 'Manage Chat', description: 'Archive conversations and manage support queues', section: 'chat', action: 'manage' },

  // Staff Management (Super Admin Exclusive)
  { key: 'admin_users.view', name: 'View Staff', description: 'View administrator and staff user accounts', section: 'admin_users', action: 'view' },
  { key: 'admin_users.create', name: 'Create Staff', description: 'Create new admin staff and assign permissions', section: 'admin_users', action: 'create' },
  { key: 'admin_users.edit', name: 'Edit Staff', description: 'Modify staff permissions and status', section: 'admin_users', action: 'edit' },
  { key: 'admin_users.delete', name: 'Delete / Disable Staff', description: 'Disable or delete staff accounts', section: 'admin_users', action: 'delete' },

  // Audit Logs
  { key: 'audit_logs.view', name: 'View Audit Trail', description: 'Inspect administrative audit logs and security trails', section: 'audit_logs', action: 'view' },
];

/**
 * Check if a user role and permissions list grant a required permission
 */
export function hasPermission(
  userRole: string | undefined | null,
  userPermissions: string[] | undefined | null,
  requiredPermission: string
): boolean {
  // Super admin has unrestricted access to everything
  if (userRole === 'super_admin') {
    return true;
  }

  // Regular user has no admin permissions
  if (userRole !== 'admin') {
    return false;
  }

  // Admin user checks
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // Wildcard grants all
  if (userPermissions.includes('*')) {
    return true;
  }

  // Exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Section-level wildcard (e.g. 'donations.*' grants 'donations.view', 'donations.create', etc.)
  const section = requiredPermission.split('.')[0];
  if (userPermissions.includes(`${section}.*`)) {
    return true;
  }

  return false;
}

/**
 * Express middleware to enforce a required permission
 */
export function requirePermission(permissionKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const userRole = (req as any).userRole || user?.role;
    const permissions = user?.permissions || [];

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account has been disabled. Please contact Super Admin." });
    }

    const authorized = hasPermission(userRole, permissions, permissionKey);
    if (!authorized) {
      return res.status(403).json({
        message: `Forbidden: You do not have permission to perform this action (${permissionKey})`,
        requiredPermission: permissionKey,
      });
    }

    next();
  };
}

/**
 * Express middleware to enforce Super Admin role only
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  const userRole = (req as any).userRole || user?.role;

  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (userRole !== 'super_admin') {
    return res.status(403).json({ message: "Forbidden: Super Administrator access required" });
  }

  next();
}

/**
 * Password Security: Hash plaintext password using bcryptjs
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Password Security: Compare plain password with stored hash
 * Transparently supports plain legacy check for smooth transition
 */
export async function comparePassword(plainPassword: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !plainPassword) return false;

  // If already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return bcrypt.compare(plainPassword, storedHash);
  }

  // Graceful legacy fallback: direct string match
  return plainPassword === storedHash;
}

/**
 * Log administrative activity to the database audit_logs table
 */
export async function logAdminActivity(
  req: Request,
  action: string,
  section: string,
  targetId?: string | number | null,
  details?: Record<string, any> | null
) {
  try {
    const user = (req as any).user;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    await storage.createAuditLog({
      userId: user?.id || null,
      userName: user?.name || user?.username || 'Unknown',
      userRole: user?.role || 'admin',
      action,
      section,
      targetId: targetId ? String(targetId) : null,
      details: details || null,
      ipAddress: Array.isArray(ip) ? ip[0] : String(ip),
    });
  } catch (err) {
    console.error('[Audit Log] Failed to record action:', err);
  }
}
