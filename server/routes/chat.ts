import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { isUserOnline, broadcastChatMessage } from '../chatSocket';
import { hasPermission, requirePermission } from '../auth/rbac';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "iskcon_juhu_jwt_secret";

// Ensure chat uploads directory exists
const chatUploadsDir = path.join(process.cwd(), 'uploads', 'chat');
if (!fs.existsSync(chatUploadsDir)) {
  fs.mkdirSync(chatUploadsDir, { recursive: true });
}

// Authentication middleware for chat routes
const requireAuth = async (req: Request, res: Response, next: express.NextFunction) => {
  try {
    let userId: number | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (tokenError) {
        // Invalid token
      }
    }

    if (!userId && (req as any).session?.userId) {
      userId = (req as any).session.userId;
    }

    if (!userId) {
      return res.status(401).json({ message: "Authentication required to access chat" });
    }

    const user = await storage.getUser(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User account is invalid or inactive" });
    }

    (req as any).user = user;
    (req as any).userId = user.id;
    (req as any).userRole = user.role;
    next();
  } catch (err) {
    console.error("Auth error in chat:", err);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Strict Admin-only middleware checking chat.view permission
const requireAdmin = (req: Request, res: Response, next: express.NextFunction) => {
  const role = (req as any).userRole;
  const permissions = (req as any).user?.permissions || [];

  if (role !== 'super_admin' && role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  if (!hasPermission(role, permissions, 'chat.view')) {
    return res.status(403).json({ message: "Forbidden: You do not have permission to view live chat (chat.view)" });
  }

  next();
};

// Safe allowed MIME types & extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.pdf', '.txt', '.doc', '.docx'
]);

// Configure Multer for Chat uploads (Strict 1 MB limit)
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, chatUploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `chat_${Date.now()}_${nanoid(8)}${ext}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 1024 * 1024, // Strict 1 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(mime) || !ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error("Invalid file type. Allowed files: JPG, PNG, WEBP, GIF, PDF, TXT, DOC, DOCX"));
    }
    cb(null, true);
  }
});

// 1. Get or Create Logged-in User's Support Conversation
router.get('/my-conversation', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const conversation = await storage.getOrCreateConversation(userId);
    const unreadCount = await storage.getUserUnreadCount(userId);

    res.json({
      conversation,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching user conversation:", error);
    res.status(500).json({ message: "Error fetching conversation" });
  }
});

// 2. Admin: Get all conversations (paginated with presence status)
router.get('/conversations', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 40;
    const offset = parseInt(req.query.offset as string) || 0;

    const conversationsList = await storage.getConversations(limit, offset);
    
    // Attach real-time online status
    const listWithPresence = conversationsList.map((conv) => ({
      ...conv,
      isOnline: isUserOnline(conv.userId),
    }));

    const totalUnread = await storage.getAdminTotalUnreadCount();

    res.json({
      conversations: listWithPresence,
      totalUnread,
    });
  } catch (error) {
    console.error("Error fetching admin conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
});

// 3. Get messages for a conversation (Strict Ownership Verification)
router.get('/messages/:conversationId', requireAuth, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await storage.getConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Ownership check: User must own the conversation OR be an Admin
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (!isAdmin && conversation.userId !== userId) {
      return res.status(403).json({ message: "Access forbidden: You do not own this conversation" });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId as string) : undefined;

    const messages = await storage.getMessages(conversationId, limit, beforeId);

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Alias for GET /conversations/:conversationId/messages
router.get('/conversations/:conversationId/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await storage.getConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (!isAdmin && conversation.userId !== userId) {
      return res.status(403).json({ message: "Access forbidden: You do not own this conversation" });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId as string) : undefined;

    const messages = await storage.getMessages(conversationId, limit, beforeId);

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// 4. Secure File Upload (< 1MB with strict size & MIME checks)
router.post('/upload', requireAuth, (req: Request, res: Response) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "File must be smaller than 1 MB." });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message || "Invalid file upload." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded" });
    }

    const fileUrl = `/api/chat/file/${req.file.filename}`;

    res.json({
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    });
  });
});

// 5. Chat File Delivery with cache headers
router.get('/file/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename); // Protect against directory traversal
  const filePath = path.join(chatUploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  // Set caching and safe content delivery
  res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
  res.sendFile(filePath);
});

// 6. Send message endpoint (Supports text and attachment metadata with instant WebSocket broadcast)
router.post('/message', requireAuth, async (req: Request, res: Response) => {
  try {
    const { conversationId, message, fileUrl, fileName, fileSize, fileType } = req.body;
    const convId = parseInt(conversationId);

    if (isNaN(convId) || (!message?.trim() && !fileUrl)) {
      return res.status(400).json({ message: "Message or file attachment is required" });
    }

    const conversation = await storage.getConversationById(convId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const user = (req as any).user;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    const isOwnConversation = conversation.userId === userId;

    if (!isOwnConversation && !isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    const senderType = isOwnConversation ? 'user' : 'admin';
    const cleanMessage = message ? String(message).slice(0, 5000) : null;

    const createdMessage = await storage.createMessage({
      conversationId: convId,
      senderId: userId,
      senderType,
      message: cleanMessage,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize ? Number(fileSize) : null,
      fileType: fileType || null,
    });

    // Broadcast over WebSocket to all participants
    broadcastChatMessage(createdMessage, convId, {
      id: userId,
      name: user.name || user.username || (senderType === 'admin' ? 'Temple Support' : 'Devotee'),
      role: userRole,
    }, conversation.userId);

    res.json({
      success: true,
      message: createdMessage,
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
});

// 7. Mark messages as read
router.patch('/messages/:conversationId/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await storage.getConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userRole = (req as any).userRole;
    const userId = (req as any).userId;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    const isOwnConversation = conversation.userId === userId;

    if (!isOwnConversation && !isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    const readerType = isOwnConversation ? 'user' : 'admin';
    await storage.markMessagesAsRead(conversationId, readerType);

    res.json({ success: true, conversationId });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

// 7. Unread counts summary
router.get('/unread-count', requireAuth, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).userRole;
    const userId = (req as any).userId;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (isAdmin) {
      const count = await storage.getAdminTotalUnreadCount();
      return res.json({ unreadCount: count });
    } else {
      const count = await storage.getUserUnreadCount(userId);
      return res.json({ unreadCount: count });
    }
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ unreadCount: 0 });
  }
});

export default router;
