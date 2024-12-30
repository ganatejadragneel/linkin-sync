import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { X, Send } from 'lucide-react';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export function LyricChatbot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: 'Hello! I\'m your Lyric Assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessage: Message = { id: messages.length + 1, sender: 'user', text: input };
      setMessages([...messages, newMessage]);
      setInput('');
      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = { 
          id: messages.length + 2, 
          sender: 'bot', 
          text: 'I\'m processing your request about lyrics. How else can I assist you?' 
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-1/4 bottom-32 w-64 bg-card text-card-foreground shadow-lg flex flex-col z-[60]">
      <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground">
        <h2 className="text-lg font-semibold">Lyric Assistant</h2>
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
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block p-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask about lyrics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow bg-muted text-muted-foreground"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}