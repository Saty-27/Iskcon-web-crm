import { useState, useEffect, useRef, useCallback } from 'react';
import useAuth from './useAuth';
import { useToast } from './use-toast';
import { Message, Conversation } from '@shared/schema';

export interface ChatMessage extends Message {
  sender?: {
    id?: number;
    name?: string;
    role?: string;
  };
}

export function useChat(propConversationId?: number | null, autoConnect: boolean = false) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const activeConvIdRef = useRef<number | null | undefined>(propConversationId);

  // Keep ref synchronized
  const activeId = propConversationId || conversation?.id;
  activeConvIdRef.current = activeId;

  // Fetch paginated messages
  const fetchMessages = useCallback(async (convId: number) => {
    if (!isAuthenticated || !convId) return;
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/chat/messages/${convId}?limit=60`, { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.conversation) {
          setConversation(data.conversation);
          activeConvIdRef.current = data.conversation.id;
        }
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [isAuthenticated]);

  // Fetch or initialize user's support conversation
  const fetchMyConversation = useCallback(async () => {
    if (!isAuthenticated) return null;
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/chat/my-conversation', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        activeConvIdRef.current = data.conversation.id;
        setUnreadCount(data.unreadCount || 0);
        
        // Auto-fetch messages for this conversation
        if (data.conversation?.id) {
          fetchMessages(data.conversation.id);
        }
        return data.conversation;
      }
    } catch (err) {
      console.error('Error fetching chat conversation:', err);
    }
    return null;
  }, [isAuthenticated, fetchMessages]);

  // Mark active conversation messages as read
  const markAsRead = useCallback(async (convId: number) => {
    if (!convId || !isAuthenticated) return;
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/chat/messages/${convId}/read`, {
        method: 'PATCH',
        headers,
        credentials: 'include'
      });

      setUnreadCount(0);

      // Emit read status over socket
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'chat:mark_read',
          payload: { conversationId: convId }
        }));
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [isAuthenticated]);

  // Connect WebSocket
  const connectSocket = useCallback(() => {
    if (!isAuthenticated || socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat?token=${encodeURIComponent(token)}`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);

        // Join active conversation if known
        if (activeConvIdRef.current) {
          ws.send(JSON.stringify({
            type: 'chat:join_conversation',
            payload: { conversationId: activeConvIdRef.current }
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);

          switch (type) {
            case 'chat:connected':
              setIsConnected(true);
              break;

            case 'chat:new_message': {
              const { message, conversationId: msgConvId } = payload;
              const currentActive = activeConvIdRef.current;
              
              // If message belongs to currently open conversation, append to list
              if (currentActive && Number(msgConvId) === Number(currentActive)) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === message.id)) return prev;
                  return [...prev, message];
                });

                // Auto mark as read if current user is active in conversation
                if (message.senderId !== user?.id) {
                  markAsRead(msgConvId);
                }
              } else {
                // Incoming message for another or closed conversation &rarr; increment badge
                if (message.senderId !== user?.id) {
                  setUnreadCount((c) => c + 1);
                }
              }
              break;
            }

            case 'chat:typing_status': {
              if (Number(payload.conversationId) === Number(activeConvIdRef.current)) {
                if (payload.userId !== user?.id) {
                  setIsTyping(payload.isTyping);
                  setTypingUser(payload.isTyping ? payload.userName : null);

                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  if (payload.isTyping) {
                    typingTimeoutRef.current = setTimeout(() => {
                      setIsTyping(false);
                      setTypingUser(null);
                    }, 3500);
                  }
                }
              }
              break;
            }

            case 'chat:messages_read': {
              if (Number(payload.conversationId) === Number(activeConvIdRef.current)) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    !msg.readAt ? { ...msg, readAt: payload.readAt || new Date() } : msg
                  )
                );
              }
              break;
            }

            case 'chat:error':
              toast({
                title: 'Chat Notice',
                description: payload.message || 'Error processing chat message.',
                variant: 'destructive'
              });
              break;

            default:
              break;
          }
        } catch (err) {
          console.error('Error handling websocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        socketRef.current = null;

        // Reconnect if not cleanly closed and user is still logged in
        if (event.code !== 4001 && isAuthenticated && autoConnect) {
          setIsReconnecting(true);
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, 3500);
        }
      };

      ws.onerror = (err) => {
        console.error('[Chat WebSocket] Error:', err);
        ws.close();
      };
    } catch (err) {
      console.error('[Chat WebSocket] Setup error:', err);
    }
  }, [isAuthenticated, autoConnect, markAsRead, toast, user?.id]);

  const disconnectSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send text or attachment message with instant delivery
  const sendMessage = useCallback(
    async (
      text?: string,
      fileMetadata?: { fileUrl: string; fileName: string; fileSize: number; fileType: string }
    ) => {
      let convId = activeConvIdRef.current;
      
      // If no active conversation id yet, ensure user conversation is loaded
      if (!convId) {
        const fetchedConv = await fetchMyConversation();
        convId = fetchedConv?.id;
      }

      if (!convId || (!text?.trim() && !fileMetadata?.fileUrl)) {
        return;
      }

      const payload = {
        conversationId: convId,
        message: text?.trim() || null,
        fileUrl: fileMetadata?.fileUrl || null,
        fileName: fileMetadata?.fileName || null,
        fileSize: fileMetadata?.fileSize || null,
        fileType: fileMetadata?.fileType || null,
      };

      // 1. Send via WebSocket if open
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'chat:send_message',
          payload
        }));
      } else {
        // 2. Only use REST fallback if WebSocket is not connected
        try {
          const token = localStorage.getItem('authToken');
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch('/api/chat/message', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const resData = await res.json();
            if (resData.message) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === resData.message.id)) return prev;
                return [...prev, resData.message];
              });
            }
          }
        } catch (restErr) {
          console.error('REST message send error:', restErr);
        }
      }
    },
    [fetchMyConversation]
  );

  // Send typing notification
  const sendTyping = useCallback(
    (isTypingState: boolean) => {
      const convId = activeConvIdRef.current;
      if (!convId || socketRef.current?.readyState !== WebSocket.OPEN) return;

      socketRef.current.send(JSON.stringify({
        type: 'chat:typing',
        payload: {
          conversationId: convId,
          isTyping: isTypingState,
        }
      }));
    },
    []
  );

  // Upload file (< 1MB strict check)
  const uploadFile = useCallback(
    async (file: File) => {
      // 1. Strict frontend size validation
      const MAX_SIZE = 1024 * 1024; // 1 MB
      if (file.size > MAX_SIZE) {
        toast({
          title: "File Too Large",
          description: "File must be smaller than 1 MB.",
          variant: "destructive"
        });
        throw new Error("File must be smaller than 1 MB.");
      }

      // 2. Allowed extensions check
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.txt', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(fileExt)) {
        toast({
          title: "Unsupported File Type",
          description: "Allowed formats: JPG, PNG, WEBP, GIF, PDF, TXT, DOC, DOCX",
          variant: "destructive"
        });
        throw new Error("Unsupported file type");
      }

      setIsUploading(true);
      try {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/chat/upload', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'File upload failed');
        }

        const data = await res.json();
        return data; // { fileUrl, fileName, fileSize, fileType }
      } catch (err: any) {
        toast({
          title: "Upload Failed",
          description: err?.message || "Could not upload file. Please try again.",
          variant: "destructive"
        });
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [toast]
  );

  // Initialize connection and history when conversationId changes
  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [autoConnect, isAuthenticated, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (propConversationId && isAuthenticated) {
      fetchMessages(propConversationId);
      markAsRead(propConversationId);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'chat:join_conversation',
          payload: { conversationId: propConversationId }
        }));
      }
    }
  }, [propConversationId, isAuthenticated, fetchMessages, markAsRead]);

  return {
    messages,
    conversation,
    unreadCount,
    isConnected,
    isReconnecting,
    isTyping,
    typingUser,
    isLoadingMessages,
    isUploading,
    fetchMyConversation,
    fetchMessages,
    sendMessage,
    sendTyping,
    uploadFile,
    markAsRead,
    connectSocket,
    disconnectSocket,
  };
}
