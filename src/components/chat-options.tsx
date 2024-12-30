import { Button } from "./ui/button";
import { MessageSquare, Users } from 'lucide-react';

interface ChatOptionsProps {
  onToggleChat: () => void;
  onToggleChatbot: () => void;
  isChatOpen: boolean;
  isChatbotOpen: boolean;
}

export function ChatOptions({ onToggleChat, onToggleChatbot, isChatOpen, isChatbotOpen }: ChatOptionsProps) {
  return (
    <div className="fixed bottom-24 left-4 mb-4 flex space-x-2 z-40">
      <Button
        variant={isChatbotOpen ? "default" : "outline"}
        size="sm"
        className={`rounded-full ${isChatbotOpen ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground'}`}
        onClick={onToggleChatbot}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Lyric Chat
      </Button>
      <Button
        variant={isChatOpen ? "default" : "outline"}
        size="sm"
        className={`rounded-full ${isChatOpen ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground'}`}
        onClick={onToggleChat}
      >
        <Users className="h-4 w-4 mr-2" />
        Global Chat
      </Button>
    </div>
  );
}