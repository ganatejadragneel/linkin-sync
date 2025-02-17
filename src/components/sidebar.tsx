import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Album, Home, Mic2, PlaySquare, User } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navItems = [
    { icon: Home, label: "About", id: 'about' },
    { icon: Album, label: "Featured", id: 'featured' },
    { icon: Mic2, label: "Artists", id: 'artists' },
    { icon: PlaySquare, label: "Playlists", id: 'playlists' },
    { icon: User, label: "Custom Playlists", id: 'custom-playlists' },
  ];

  return (
    <div className="w-64 bg-card text-card-foreground p-4 hidden md:block z-10">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start ${
                activeSection === item.id 
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}