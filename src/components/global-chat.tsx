// src/components/global-chat.tsx
import { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { X, Loader2 } from 'lucide-react';
import { useToast } from "./ui/use-toast";

interface Message {
  id: number;
  user_email: string;
  username: string;
  text: string;
  created_at: string;
}

export function GlobalChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]); // Initialize as empty array
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      try {
        setUserProfile(JSON.parse(profile));
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      // Ensure data is an array
      setMessages(Array.isArray(data) ? data : []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      console.error('Error fetching messages:', error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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
      setError(null);
      const response = await fetch('http://localhost:8080/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userProfile.email,
          username: userProfile.display_name,
          text: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Error sending message:', error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-24 w-80 bg-card text-card-foreground shadow-lg flex flex-col z-50">
      <div className="flex justify-between items-center p-4 border-b border-border bg-primary">
        <h2 className="text-lg font-semibold text-primary-foreground">Global Chat</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="text-primary-foreground hover:text-primary hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-grow p-4"
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-destructive text-center p-4">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            No messages yet
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 ${
                message.user_email === userProfile?.email ? 'text-right' : 'text-left'
              }`}
            >
              <div className="inline-block max-w-[80%]">
                <p className={`text-sm font-semibold mb-1 ${
                  message.user_email === userProfile?.email ? 'text-primary' : 'text-primary'
                }`}>
                  {message.username}
                </p>
                <div className={`p-3 rounded-lg break-words ${
                  message.user_email === userProfile?.email 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <p>{message.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder={userProfile ? "Type a message..." : "Please log in to chat"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-muted text-muted-foreground"
            disabled={!userProfile || isSending}
          />
          <Button 
            type="submit" 
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={!userProfile || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}