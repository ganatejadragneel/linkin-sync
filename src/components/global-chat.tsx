// Refactored Global Chat component using new services and hooks
import { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { X, Loader2 } from 'lucide-react';
import { useToast } from "./ui/use-toast";
import { backendApiService } from '../services/api';
import { storageService } from '../services/storage.service';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { usePolling } from '../hooks/usePolling';
import { useScrollToBottom } from '../hooks/useScrollToBottom';
import { POLLING_INTERVALS } from '../constants';
import { ChatMessage } from '../types';

export function GlobalChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const userProfile = storageService.getUserProfile();
  
  // Auto-scroll to bottom when messages change
  useScrollToBottom(scrollAreaRef, [messages]);

  const fetchMessages = async () => {
    try {
      if (!isLoading) {
        setIsLoading(true);
        const data = await backendApiService.getGlobalChatMessages();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      handleError(error, { defaultMessage: 'Failed to load messages' });
    } finally {
      setIsLoading(false);
    }
  };

  // Use polling hook for fetching messages
  usePolling(fetchMessages, {
    interval: POLLING_INTERVALS.GLOBAL_CHAT,
    enabled: isOpen,
    immediate: true,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast({
        title: "Error",
        description: "Please log in to send messages",
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      await backendApiService.sendGlobalChatMessage({
        user_email: userProfile.email,
        username: userProfile.display_name,
        text: newMessage,
      });
      
      setNewMessage('');
      await fetchMessages(); // Refresh messages
      
      // Refocus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      handleError(error, { defaultMessage: 'Failed to send message' });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={onClose}>
      <div 
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">Global Chat</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No messages yet. Be the first to say hello!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {getUserInitials(message.username)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-medium text-sm">{message.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          {userProfile ? (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-sm">Send</span>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
              Please log in to send messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}