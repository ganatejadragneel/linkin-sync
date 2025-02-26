import { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { X, Send, Loader2 } from 'lucide-react';
import { sendChatMessage, getNowPlaying } from '../services/lyricService';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  isLoading?: boolean;
}

export function LyricChatbot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: "Hello! I'm your Lyric Assistant. I can help you understand the lyrics of the currently playing song. Ask me anything about the meaning, themes, or context of the song." },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch the currently playing song when the component mounts
  useEffect(() => {
    if (isOpen) {
      fetchCurrentSong();
    }
  }, [isOpen]);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const fetchCurrentSong = async () => {
    try {
      const song = await getNowPlaying();
      setCurrentSong(song);
      
      // If we have a new song, add a message about it
      if (song && (!currentSong || song.track_id !== currentSong.track_id)) {
        setMessages(prev => [
          ...prev,
          { 
            id: Date.now(), 
            sender: 'bot', 
            text: `I'm now ready to answer questions about "${song.track_name}" by ${song.artist}.`
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching current song:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessageId = Date.now();
    const userMessage: Message = { 
      id: userMessageId, 
      sender: 'user', 
      text: input 
    };
    
    // Add loading message from bot
    const botLoadingMessageId = userMessageId + 1;
    const botLoadingMessage: Message = {
      id: botLoadingMessageId,
      sender: 'bot',
      text: 'Thinking...',
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, botLoadingMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send to backend
      const response = await sendChatMessage(input);
      
      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingMessageId
          ? { id: msg.id, sender: 'bot', text: response.answer || response.error || "Sorry, I couldn't process that." }
          : msg
      ));
    } catch (error) {
      console.error('Failed to get response:', error);
      
      // Replace loading message with error
      setMessages(prev => prev.map(msg => 
        msg.id === botLoadingMessageId
          ? { id: msg.id, sender: 'bot', text: "Sorry, I couldn't connect to the lyrics service. Please try again later." }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-32 w-1/3 bg-card text-card-foreground shadow-lg flex flex-col z-[60]">
      <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground">
        <div>
          <h2 className="text-lg font-semibold">Lyric Assistant</h2>
          {currentSong && (
            <p className="text-xs">Now playing: {currentSong.track_name} by {currentSong.artist}</p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="text-primary-foreground hover:text-primary hover:bg-secondary"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {message.isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{message.text}</span>
                </div>
              ) : (
                <p className="whitespace-pre-line">{message.text}</p>
              )}
            </div>
          </div>
        ))}
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask about the current song lyrics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-grow bg-muted text-muted-foreground"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}