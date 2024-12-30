import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { X } from 'lucide-react';

interface Message {
  id: number;
  user: string;
  text: string;
}

export function GlobalChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: 'Alice', text: 'Hello everyone!' },
    { id: 2, user: 'Bob', text: 'Hi Alice, how are you?' },
    { id: 3, user: 'Charlie', text: 'Hey folks, what\'s the topic today?' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, user: 'You', text: newMessage }]);
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 bottom-24 w-80 bg-card text-card-foreground shadow-lg flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-border bg-primary">
        <h2 className="text-lg font-semibold text-primary-foreground">Global Chat</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:text-primary hover:bg-secondary">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <p className="font-semibold text-primary">{message.user}</p>
            <p className="text-muted-foreground">{message.text}</p>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-muted text-muted-foreground"
          />
          <Button type="submit" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Send</Button>
        </div>
      </form>
    </div>
  );
}