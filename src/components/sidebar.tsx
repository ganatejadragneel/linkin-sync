import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Album, Home, Mic2, PlaySquare, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: "About" },
  { icon: Album, label: "Bands" },
  { icon: Mic2, label: "Artists" },
  { icon: PlaySquare, label: "Playlists" },
  { icon: User, label: "Custom Playlists" },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-primary text-primary-foreground p-4 hidden md:block z-10">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-secondary hover:text-primary hover:bg-secondary"
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