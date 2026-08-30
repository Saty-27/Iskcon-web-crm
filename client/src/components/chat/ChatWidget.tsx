import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  FileText, 
  Download, 
  Loader2, 
  Check, 
  CheckCheck,
  User,
  ShieldCheck,
  AlertCircle,
  Minimize2,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, user } = useAuth();
  
  // Don't display floating user widget on admin chat page itself
  const isAdminChatPage = location === '/admin/chat' || location.startsWith('/admin');

  const {
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
    sendMessage,
    sendTyping,
    uploadFile,
    connectSocket,
    markAsRead,
  } = useChat(undefined, false);

  // Auto-close chat window on navigating to /register, /login, or any auth/admin route
  useEffect(() => {
    if (location === '/register' || location === '/login' || location.startsWith('/admin')) {
      setIsOpen(false);
    }
  }, [location]);

  // Handle direct navigation with auto-closing
  const handleAuthNavigation = (path: string) => {
    setIsOpen(false);
    setIsMinimized(false);
    setLocation(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchMyConversation().then((conv) => {
        if (conv) {
          connectSocket();
        }
      });
    }
  }, [isOpen, isAuthenticated, fetchMyConversation, connectSocket]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (conversation?.id) {
        markAsRead(conversation.id);
      }
    }
  }, [messages, isOpen, isMinimized, conversation?.id, markAsRead]);

  // Handle text input typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (conversation?.id) {
      sendTyping(e.target.value.length > 0);
    }
  };

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File must be smaller than 1 MB.");
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

  // Send message handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    try {
      let fileMeta = undefined;
      if (selectedFile) {
        fileMeta = await uploadFile(selectedFile);
        removeSelectedFile();
      }

      await sendMessage(inputText.trim(), fileMeta);
      setInputText('');
      sendTyping(false);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (isAdminChatPage) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans print:hidden">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-full shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-orange-300"
          aria-label="Open Temple Support Chat"
        >
          <MessageCircle className="w-7 h-7 animate-pulse" />
          
          {/* Unread Badge */}
          {isAuthenticated && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-6 min-w-6 items-center justify-center px-1.5 rounded-full bg-red-600 text-white text-xs font-bold ring-2 ring-white animate-bounce shadow-md">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* Tooltip */}
          <span className="absolute right-16 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
            {isAuthenticated ? "Live Temple Support" : "Login to Chat"}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`flex flex-col bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-[92vw] sm:w-[380px] md:w-[420px] h-[520px] max-h-[85vh]'
        }`}>
          
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white select-none shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-orange-600 ${
                  isConnected ? 'bg-green-400' : 'bg-amber-300 animate-ping'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                  ISKCON Juhu Support
                </h3>
                <p className="text-[11px] text-orange-100 leading-none">
                  {isReconnecting ? 'Connecting...' : isConnected ? 'Online • Temple Helpdesk' : 'Direct Assistance'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when expanded */}
          {!isMinimized && (
            <>
              {/* Not Logged In Prompt */}
              {!isAuthenticated ? (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-orange-50/30">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-3 shadow-inner">
                    <User className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">
                    Sign in to Start Chatting
                  </h4>
                  <p className="text-xs text-gray-600 max-w-xs mb-5">
                    Connect directly with our temple administration for donation queries, seva assistance, or spiritual questions.
                  </p>
                  <div className="w-full space-y-2.5 max-w-xs">
                    <Link 
                      href={`/login?redirect=${encodeURIComponent(location || '/')}`}
                      onClick={() => {
                        setIsOpen(false);
                        setIsMinimized(false);
                      }}
                      className="w-full flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer select-none"
                    >
                      Login to Chat
                    </Link>

                    <Link 
                      href="/register"
                      onClick={() => {
                        setIsOpen(false);
                        setIsMinimized(false);
                      }}
                      className="w-full flex items-center justify-center bg-white border-2 border-orange-300 text-orange-800 hover:bg-orange-50 font-semibold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer select-none"
                    >
                      Register New Account
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50/50 via-white to-orange-50/20 text-xs">
                    
                    {/* Welcome Banner */}
                    <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl text-center text-[11.5px] text-amber-900 leading-relaxed shadow-2xs">
                      🙏 Hare Krishna <strong>{user?.name || user?.username}</strong>! How may we assist you in your seva today?
                    </div>

                    {isLoadingMessages && messages.length === 0 && (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                      </div>
                    )}

                    {messages.map((msg) => {
                      const isMe = msg.senderType === 'user';
                      const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[82%] rounded-2xl p-3 shadow-sm ${
                            isMe 
                              ? 'bg-orange-500 text-white rounded-br-none' 
                              : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-none shadow-xs'
                          }`}>
                            {/* Text message */}
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
                                    <div className="space-y-1.5 group/img">
                                      <a 
                                        href={msg.fileUrl || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="relative block overflow-hidden rounded-xl bg-black/5 hover:opacity-95 transition-opacity group-hover/img:ring-2 group-hover/img:ring-orange-400 cursor-pointer"
                                        title="Click to view full image in a new tab"
                                      >
                                        <img 
                                          src={msg.fileUrl || ''} 
                                          alt={msg.fileName || 'Attached Image'} 
                                          className="max-h-60 w-full rounded-xl object-contain bg-slate-900/5 shadow-inner" 
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-2xs">
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
                                            <ExternalLink className="w-3 h-3" />
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
                                          ? 'bg-orange-600 text-white hover:bg-orange-700' 
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
                                  <span className="text-[9.5px] opacity-75 mt-0.5 block">
                                    {(msg.fileSize / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Time & Read Status */}
                            <div className={`flex items-center justify-end gap-1 mt-1 text-[9.5px] ${
                              isMe ? 'text-orange-100' : 'text-gray-400'
                            }`}>
                              <span>{formattedTime}</span>
                              {isMe && (
                                <span>
                                  {msg.readAt ? (
                                    <CheckCheck className="w-3 h-3 text-white" />
                                  ) : (
                                    <Check className="w-3 h-3 text-orange-200" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 italic bg-white p-2 rounded-xl border border-gray-100 max-w-[60%] shadow-2xs">
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span>Admin is typing...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attachment Preview Chip */}
                  {selectedFile && (
                    <div className="px-4 py-2 bg-orange-50 border-t border-orange-100 flex items-center justify-between gap-2 text-xs text-gray-800">
                      <div className="flex items-center gap-2 truncate">
                        {filePreviewUrl ? (
                          <img src={filePreviewUrl} alt="Preview" className="w-8 h-8 object-cover rounded border border-orange-200" />
                        ) : (
                          <FileText className="w-5 h-5 text-orange-600" />
                        )}
                        <div className="truncate">
                          <p className="font-semibold truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB (Max 1 MB)</p>
                        </div>
                      </div>
                      <button
                        onClick={removeSelectedFile}
                        className="p-1 hover:bg-orange-200 text-gray-500 hover:text-gray-800 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Input Form */}
                  <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
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
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Attach file (Max 1 MB: Images, PDF, Docs)"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={inputText}
                      onChange={handleInputChange}
                      disabled={isUploading}
                      className="flex-1 h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white text-xs"
                    />

                    <Button
                      type="submit"
                      disabled={(!inputText.trim() && !selectedFile) || isUploading}
                      className="h-10 w-10 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </>
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default ChatWidget;
