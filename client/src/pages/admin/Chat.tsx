import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import AdminLayout from '@/components/admin/Layout';
import { 
  Search, 
  Send, 
  Paperclip, 
  FileText, 
  Download, 
  Loader2, 
  Check, 
  CheckCheck,
  User,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';
import { Message } from '@shared/schema';

interface AdminConversation {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessageText: string | null;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  userRole: string;
  userUsername: string;
  unreadCount: number;
  isOnline?: boolean;
}

const AdminChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userTypingMap, setUserTypingMap] = useState<Record<number, boolean>>({});

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedConvRef = useRef<AdminConversation | null>(selectedConversation);

  selectedConvRef.current = selectedConversation;

  // Fetch all conversations for admin list
  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/chat/conversations?limit=60', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching admin conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Fetch messages for a specific conversation
  const fetchMessagesForConv = useCallback(async (convId: number) => {
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/chat/messages/${convId}?limit=60`, { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        // Guard against race condition: Only commit if still viewing this conversation
        if (selectedConvRef.current?.id === convId) {
          setMessages(data.messages || []);
        }
      }
    } catch (err) {
      console.error('Error loading conversation messages:', err);
    } finally {
      if (selectedConvRef.current?.id === convId) {
        setIsLoadingMessages(false);
      }
    }
  }, []);

  // Mark conversation read
  const markConversationRead = useCallback(async (convId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/chat/messages/${convId}/read`, {
        method: 'PATCH',
        headers,
        credentials: 'include'
      });

      // Update local unread counter
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'chat:mark_read',
          payload: { conversationId: convId }
        }));
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, []);

  // Select conversation - with instant previous state clearing
  const handleSelectConversation = (conv: AdminConversation) => {
    if (selectedConversation?.id === conv.id) return;

    // 1. Immediately update selected conversation and sync ref
    setSelectedConversation(conv);
    selectedConvRef.current = conv;

    // 2. CRITICAL: Instantly clear previous conversation messages to prevent cross-chat mixing
    setMessages([]);
    setIsLoadingMessages(true);

    // 3. Inform WebSocket server about joined conversation
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat:join_conversation',
        payload: { conversationId: conv.id }
      }));
    }

    // 4. Fetch only this specific conversation's history
    fetchMessagesForConv(conv.id);

    // 5. Mark messages in this conversation as read
    markConversationRead(conv.id);
  };

  // Connect WebSocket
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      if (selectedConvRef.current?.id) {
        ws.send(JSON.stringify({
          type: 'chat:join_conversation',
          payload: { conversationId: selectedConvRef.current.id }
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);

        switch (type) {
          case 'chat:new_message': {
            const { message, conversationId, sender } = payload;
            const currentSelected = selectedConvRef.current;
            const msgConvId = Number(conversationId);

            // STRICT CONVERSATION ISOLATION:
            // Only append to the active messages list if this message strictly belongs to the currently open conversation!
            if (currentSelected && Number(currentSelected.id) === msgConvId) {
              setMessages((prev) => {
                if (Number(message.conversationId) !== msgConvId) return prev;
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
              });
              if (message.senderType === 'user') {
                markConversationRead(msgConvId);
              }
            }

            // Update conversation list order, last message snippet, and unread counts
            setConversations((prev) => {
              const existingIndex = prev.findIndex((c) => c.id === msgConvId);
              const snippet = message.message || (message.fileName ? `📎 ${message.fileName}` : 'Attachment');
              
              if (existingIndex > -1) {
                const updated = [...prev];
                const targetConv = { ...updated[existingIndex] };
                targetConv.lastMessageAt = message.createdAt;
                targetConv.lastMessageText = snippet;
                
                const isCurrentlyOpen = currentSelected && Number(currentSelected.id) === msgConvId;
                if (!isCurrentlyOpen && message.senderType === 'user') {
                  targetConv.unreadCount = (targetConv.unreadCount || 0) + 1;
                } else if (isCurrentlyOpen) {
                  targetConv.unreadCount = 0;
                }
                
                // Move updated conversation to top of list
                updated.splice(existingIndex, 1);
                return [targetConv, ...updated];
              } else {
                fetchConversations();
                return prev;
              }
            });

            // Notification toast for incoming user messages when not currently viewing that chat
            if (message.senderType === 'user' && (!currentSelected || Number(currentSelected.id) !== msgConvId)) {
              toast({
                title: `💬 New Message from ${sender?.name || 'Devotee'}`,
                description: message.message ? (message.message.length > 50 ? message.message.slice(0, 47) + '...' : message.message) : 'Sent an attachment',
              });
            }
            break;
          }

          case 'chat:user_presence': {
            const { userId, status } = payload;
            setConversations((prev) =>
              prev.map((c) => (c.userId === userId ? { ...c, isOnline: status === 'online' } : c))
            );
            break;
          }

          case 'chat:typing_status': {
            const { conversationId, isTyping } = payload;
            setUserTypingMap((prev) => ({
              ...prev,
              [conversationId]: isTyping,
            }));
            break;
          }

          case 'chat:messages_read': {
            const { conversationId, readAt } = payload;
            if (selectedConvRef.current && selectedConvRef.current.id === Number(conversationId)) {
              setMessages((prev) =>
                prev.map((m) => (!m.readAt ? { ...m, readAt: readAt || new Date() } : m))
              );
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing admin websocket message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [fetchConversations, markConversationRead, toast]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File must be smaller than 1 MB.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || (!inputText.trim() && !selectedFile)) return;

    try {
      let fileMeta = undefined;
      if (selectedFile) {
        setIsUploading(true);
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const formData = new FormData();
        formData.append('file', selectedFile);

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

        fileMeta = await res.json();
        removeSelectedFile();
        setIsUploading(false);
      }

      const payload = {
        conversationId: selectedConversation.id,
        message: inputText.trim() || null,
        fileUrl: fileMeta?.fileUrl || null,
        fileName: fileMeta?.fileName || null,
        fileSize: fileMeta?.fileSize || null,
        fileType: fileMeta?.fileType || null,
      };

      // 1. Send via WebSocket if connected
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'chat:send_message',
          payload
        }));
      } else {
        // 2. Fallback via REST API only if WebSocket is disconnected
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/chat/message', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.message && Number(selectedConvRef.current?.id) === Number(payload.conversationId)) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === resData.message.id)) return prev;
              return [...prev, resData.message];
            });
          }
        }
      }

      setInputText('');
    } catch (err: any) {
      toast({
        title: "Error Sending Message",
        description: err?.message || "Failed to send message.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  // Filtered conversation list
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.userName?.toLowerCase().includes(q) ||
      c.userEmail?.toLowerCase().includes(q) ||
      c.userUsername?.toLowerCase().includes(q) ||
      c.userPhone?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <Helmet>
        <title>Live Chat Management - ISKCON Juhu Admin</title>
      </Helmet>

      <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Live Support Chat
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono">
                  {conversations.length} {conversations.length === 1 ? 'user' : 'users'}
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Real-time 1:1 support desk for registered devotees and donors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 bg-white shadow-2xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-gray-600">{isConnected ? 'Server Connected' : 'Disconnected'}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConversations}
              disabled={isLoadingConversations}
              className="rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoadingConversations ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Chat Two-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Conversations List */}
          <div className="w-80 sm:w-96 border-r border-gray-200 flex flex-col bg-gray-50/40">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search devotees by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {isLoadingConversations && conversations.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  {searchQuery ? "No conversations matching your search" : "No chats yet. When a user opens chat, it will appear here."}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  const timeFormatted = new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-purple-50 border-l-4 border-purple-600' 
                          : 'hover:bg-gray-100/80 bg-white'
                      }`}
                    >
                      {/* Avatar with Presence Indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs text-sm">
                          {conv.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          conv.isOnline ? 'bg-green-500 ring-1 ring-green-300' : 'bg-gray-300'
                        }`} />
                      </div>

                      {/* Info & Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="font-semibold text-xs text-gray-900 truncate">
                            {conv.userName}
                          </h4>
                          <span className="text-[10px] text-gray-400 flex-shrink-0 font-mono">
                            {timeFormatted}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 truncate mb-1">
                          {userTypingMap[conv.id] ? (
                            <span className="text-purple-600 font-medium italic">Typing...</span>
                          ) : (
                            conv.lastMessageText || 'Started a conversation'
                          )}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 truncate max-w-[140px]">
                            {conv.userEmail}
                          </span>
                          
                          {/* Unread Counter Badge */}
                          {conv.unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full shadow-xs">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Conversation Chat Room */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Chat Room Top Bar */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {selectedConversation.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        selectedConversation.isOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        {selectedConversation.userName}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          selectedConversation.isOnline ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {selectedConversation.isOnline ? '● Online' : 'Offline'}
                        </span>
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" /> {selectedConversation.userEmail}
                        </span>
                        {selectedConversation.userPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {selectedConversation.userPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50/50 via-white to-purple-50/10">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-xs text-gray-400">
                      No messages in this conversation yet.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderType === 'admin';
                      const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-xs ${
                            isMe 
                              ? 'bg-purple-600 text-white rounded-br-none' 
                              : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-none shadow-2xs'
                          }`}>
                            {msg.message && (
                              <p className="whitespace-pre-wrap break-words leading-relaxed text-xs">
                                {msg.message}
                              </p>
                            )}

                            {/* File Attachment */}
                            {msg.fileUrl && (
                              <div className="mt-2 pt-2 border-t border-black/10">
                                {(() => {
                                  const isImg = msg.fileType?.startsWith('image/') || 
                                    /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(msg.fileUrl || '') || 
                                    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(msg.fileName || '');

                                  return isImg ? (
                                    <div className="space-y-1.5 group/adminimg">
                                      <a 
                                        href={msg.fileUrl || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="relative block overflow-hidden rounded-xl bg-black/5 hover:opacity-95 transition-opacity group-hover/adminimg:ring-2 group-hover/adminimg:ring-purple-400 cursor-pointer"
                                        title="Click to view full image in a new tab"
                                      >
                                        <img 
                                          src={msg.fileUrl || ''} 
                                          alt={msg.fileName || 'Attachment'} 
                                          className="max-h-60 w-full rounded-xl object-contain bg-slate-900/5 shadow-inner" 
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/adminimg:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-2xs">
                                          <span>Open Image</span>
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </div>
                                      </a>
                                      {msg.fileName && (
                                        <div className="flex items-center justify-between gap-2 px-1 text-[10px] opacity-80">
                                          <span className="truncate font-medium">{msg.fileName}</span>
                                          <a 
                                            href={msg.fileUrl || '#'} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="hover:underline flex items-center gap-0.5 flex-shrink-0"
                                            title="Open image"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <a
                                      href={msg.fileUrl || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.01] cursor-pointer ${
                                        isMe 
                                          ? 'bg-purple-700 text-white hover:bg-purple-800' 
                                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                      }`}
                                      title="Click to view file in new tab"
                                    >
                                      <FileText className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate flex-1 font-medium">{msg.fileName || 'Document / File'}</span>
                                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                                    </a>
                                  );
                                })()}
                                {msg.fileSize && (
                                  <span className="text-[10px] opacity-75 mt-0.5 block">
                                    {(msg.fileSize / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Time & Read Status */}
                            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? 'text-purple-200' : 'text-gray-400'
                            }`}>
                              <span>{formattedTime}</span>
                              {isMe && (
                                <span>
                                  {msg.readAt ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-white" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-purple-300" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing indicator */}
                  {userTypingMap[selectedConversation.id] && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 italic bg-white p-2 rounded-xl border border-gray-100 max-w-[40%] shadow-2xs">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span>{selectedConversation.userName} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* File Attachment Chip */}
                {selectedFile && (
                  <div className="px-5 py-2.5 bg-purple-50 border-t border-purple-100 flex items-center justify-between gap-2 text-xs text-gray-800">
                    <div className="flex items-center gap-2 truncate">
                      {filePreviewUrl ? (
                        <img src={filePreviewUrl} alt="Preview" className="w-8 h-8 object-cover rounded border border-purple-200" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                      <div className="truncate">
                        <p className="font-semibold truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB (Max 1 MB)</p>
                      </div>
                    </div>
                    <button
                      onClick={removeSelectedFile}
                      className="p-1 hover:bg-purple-200 text-gray-500 hover:text-gray-800 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Composer */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.doc,.docx"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Attach file (< 1 MB: Images, PDF, Docs)"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <Input
                    type="text"
                    placeholder="Type an instant reply to devotee..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isUploading}
                    className="flex-1 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-xs"
                  />

                  <Button
                    type="submit"
                    disabled={(!inputText.trim() && !selectedFile) || isUploading}
                    className="h-11 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Reply</span>
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/50">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 shadow-inner">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1">
                  Select a Conversation
                </h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Click on any devotee from the left list to view their support request, view attached documents, and send real-time replies.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminChat;
