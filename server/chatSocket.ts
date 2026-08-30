import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import url from 'url';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { hasPermission } from './auth/rbac';

const JWT_SECRET = process.env.JWT_SECRET || "iskcon_juhu_jwt_secret";

interface AuthenticatedSocket extends WebSocket {
  userId?: number;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  userPermissions?: string[];
  activeConversationId?: number;
  isAlive?: boolean;
}

// Active connection registry
const userSockets = new Map<number, Set<AuthenticatedSocket>>();
const adminSockets = new Set<AuthenticatedSocket>();

export function setupChatWebSocket(server: Server) {
  const wss = new WebSocketServer({
    noServer: true,
  });

  // Attach to server's upgrade event for /ws/chat path (works alongside Vite HMR)
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = url.parse(request.url || '');
    if (pathname === '/ws/chat') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  console.log('✓ Real-time Chat WebSocket Server mounted at /ws/chat');

  // Heartbeat to prune dead socket connections
  const interval = setInterval(() => {
    wss.clients.forEach((wsClient) => {
      const socket = wsClient as AuthenticatedSocket;
      if (socket.isAlive === false) {
        return socket.terminate();
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  wss.on('connection', async (ws: AuthenticatedSocket, req) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    try {
      const parsedUrl = url.parse(req.url || '', true);
      let token = (parsedUrl.query.token as string) || (req.headers['sec-websocket-protocol'] as string);

      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }

      if (!token) {
        console.log('[WebSocket] Connection rejected: No token provided');
        ws.close(4001, 'Unauthorized: Token required');
        return;
      }

      // Verify JWT token
      let decoded: { userId: number };
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      } catch (err) {
        console.log('[WebSocket] Connection rejected: Invalid token');
        ws.close(4001, 'Unauthorized: Invalid token');
        return;
      }

      const user = await storage.getUser(decoded.userId);
      if (!user || !user.isActive) {
        console.log('[WebSocket] Connection rejected: User not found or inactive');
        ws.close(4001, 'Unauthorized: User not found');
        return;
      }

      // Associate user metadata to socket
      ws.userId = user.id;
      ws.userRole = user.role;
      ws.userName = user.name;
      ws.userEmail = user.email;
      ws.userPermissions = user.role === 'super_admin' ? ['*'] : (user.permissions || []);

      // Register socket in memory
      if (!userSockets.has(user.id)) {
        userSockets.set(user.id, new Set());
      }
      userSockets.get(user.id)!.add(ws);

      // Only add to adminSockets room if user has chat.view permission
      const canViewChat = hasPermission(user.role, ws.userPermissions, 'chat.view');
      if (canViewChat) {
        adminSockets.add(ws);
      }

      console.log(`[WebSocket] User connected: ${user.name} (ID: ${user.id}, Role: ${user.role}, ChatAccess: ${canViewChat})`);

      // Broadcast online status to authorized admins if a regular user connected
      if (user.role === 'user') {
        broadcastToAdmins({
          type: 'chat:user_presence',
          payload: {
            userId: user.id,
            status: 'online',
          }
        });
      }

      // Send connection acknowledgement
      ws.send(JSON.stringify({
        type: 'chat:connected',
        payload: {
          userId: user.id,
          userName: user.name,
          role: user.role,
        }
      }));

      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          const { type, payload } = parsed;

          switch (type) {
            case 'chat:join_conversation': {
              const conversationId = Number(payload.conversationId);
              if (!conversationId) return;

              // Validate access
              const conversation = await storage.getConversationById(conversationId);
              if (!conversation) return;

              const isAdminUser = ws.userRole === 'super_admin' || ws.userRole === 'admin';
              const hasChatView = hasPermission(ws.userRole, ws.userPermissions, 'chat.view');

              if (isAdminUser && !hasChatView) {
                ws.send(JSON.stringify({
                  type: 'chat:error',
                  payload: { message: 'Permission denied: chat.view required' }
                }));
                return;
              }

              if (!isAdminUser && conversation.userId !== ws.userId) {
                ws.send(JSON.stringify({
                  type: 'chat:error',
                  payload: { message: 'Access denied to this conversation' }
                }));
                return;
              }

              ws.activeConversationId = conversationId;
              
              // Mark unread messages as read
              const readerType = isAdminUser ? 'admin' : 'user';
              await storage.markMessagesAsRead(conversationId, readerType);

              // Notify sender of read status
              const targetUserId = isAdminUser ? conversation.userId : null;
              if (targetUserId) {
                sendToUser(targetUserId, {
                  type: 'chat:messages_read',
                  payload: { conversationId, readBy: 'admin', readAt: new Date() }
                });
              } else {
                broadcastToAdmins({
                  type: 'chat:messages_read',
                  payload: { conversationId, readBy: 'user', readAt: new Date() }
                });
              }
              break;
            }

            case 'chat:send_message': {
              const { conversationId, message, fileUrl, fileName, fileSize, fileType } = payload;
              
              if (!conversationId || (!message && !fileUrl)) {
                return;
              }

              const convId = Number(conversationId);
              const conversation = await storage.getConversationById(convId);
              if (!conversation) {
                ws.send(JSON.stringify({
                  type: 'chat:error',
                  payload: { message: 'Conversation not found' }
                }));
                return;
              }

              const isAdminUser = ws.userRole === 'super_admin' || ws.userRole === 'admin';

              // Admin permission check for replying in chat
              if (isAdminUser) {
                const canReply = hasPermission(ws.userRole, ws.userPermissions, 'chat.reply');
                if (!canReply) {
                  ws.send(JSON.stringify({
                    type: 'chat:error',
                    payload: { message: 'Permission denied: chat.reply required to send messages' }
                  }));
                  return;
                }
              } else if (conversation.userId !== ws.userId) {
                ws.send(JSON.stringify({
                  type: 'chat:error',
                  payload: { message: 'Forbidden: You do not own this conversation' }
                }));
                return;
              }

              // Limit message length
              const cleanMessage = message ? String(message).slice(0, 5000) : null;
              const senderType = isAdminUser ? 'admin' : 'user';

              // Persist message
              const createdMessage = await storage.createMessage({
                conversationId: convId,
                senderId: ws.userId!,
                senderType,
                message: cleanMessage,
                fileUrl: fileUrl || null,
                fileName: fileName || null,
                fileSize: fileSize ? Number(fileSize) : null,
                fileType: fileType || null,
              });

              console.log(`[WebSocket] Message stored for conversation #${convId} from ${ws.userName} (${senderType})`);

              // Dispatch via broadcast helper
              broadcastChatMessage(createdMessage, convId, {
                id: ws.userId!,
                name: ws.userName || (isAdminUser ? 'Temple Support' : 'Devotee'),
                role: ws.userRole || 'user',
              }, conversation.userId);
              break;
            }

            case 'chat:typing': {
              const { conversationId, isTyping } = payload;
              const convId = Number(conversationId);
              if (!convId) return;

              const conversation = await storage.getConversationById(convId);
              if (!conversation) return;

              const typingPayload = {
                type: 'chat:typing_status',
                payload: {
                  conversationId: convId,
                  userId: ws.userId,
                  userName: ws.userName,
                  isTyping: !!isTyping,
                  senderType: ws.userRole === 'admin' ? 'admin' : 'user',
                }
              };

              if (ws.userRole === 'admin') {
                sendToUser(conversation.userId, typingPayload);
              } else {
                broadcastToAdmins(typingPayload);
              }
              break;
            }

            case 'chat:mark_read': {
              const { conversationId } = payload;
              const convId = Number(conversationId);
              if (!convId) return;

              const conversation = await storage.getConversationById(convId);
              if (!conversation) return;

              const readerType = ws.userRole === 'admin' ? 'admin' : 'user';
              await storage.markMessagesAsRead(convId, readerType);

              const readPayload = {
                type: 'chat:messages_read',
                payload: {
                  conversationId: convId,
                  readBy: readerType,
                  readAt: new Date(),
                }
              };

              if (readerType === 'admin') {
                sendToUser(conversation.userId, readPayload);
                broadcastToAdmins(readPayload);
              } else {
                broadcastToAdmins(readPayload);
              }
              break;
            }

            default:
              break;
          }
        } catch (err) {
          console.error('[WebSocket] Error processing message:', err);
        }
      });

      // Cleanup on disconnect
      ws.on('close', () => {
        if (ws.userId && userSockets.has(ws.userId)) {
          const userSet = userSockets.get(ws.userId)!;
          userSet.delete(ws);
          if (userSet.size === 0) {
            userSockets.delete(ws.userId);
            // User went completely offline
            if (ws.userRole !== 'admin') {
              broadcastToAdmins({
                type: 'chat:user_presence',
                payload: {
                  userId: ws.userId,
                  status: 'offline',
                }
              });
            }
          }
        }

        if (ws.userRole === 'admin') {
          adminSockets.delete(ws);
        }
        console.log(`[WebSocket] Socket disconnected for user: ${ws.userName} (ID: ${ws.userId})`);
      });

    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
      ws.close(4000, 'Server Error');
    }
  });

  return wss;
}

// Helpers to dispatch messages to sockets
export function broadcastToAdmins(data: any) {
  const jsonStr = JSON.stringify(data);
  adminSockets.forEach((adminSocket) => {
    if (adminSocket.readyState === WebSocket.OPEN) {
      adminSocket.send(jsonStr);
    }
  });
}

export function sendToUser(userId: number, data: any) {
  const userSet = userSockets.get(userId);
  if (!userSet) return;

  const jsonStr = JSON.stringify(data);
  userSet.forEach((clientSocket) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(jsonStr);
    }
  });
}

export function broadcastChatMessage(
  message: any,
  conversationId: number,
  sender: { id: number; name: string; role: string },
  conversationUserId: number
) {
  const messagePayload = {
    type: 'chat:new_message',
    payload: {
      message,
      conversationId,
      sender,
    }
  };

  // Broadcast to all active admin sockets
  broadcastToAdmins(messagePayload);

  // Broadcast to target user's active sockets
  sendToUser(conversationUserId, messagePayload);
}

export function isUserOnline(userId: number): boolean {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0;
}
