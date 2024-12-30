import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Camera, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-primary/90 backdrop-blur supports-[backdrop-filter]:bg-primary/60">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-primary-foreground">Linkin Sync</h1>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 bg-background/90 text-foreground placeholder:text-muted-foreground border-transparent focus:border-ring"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Camera className="h-5 w-5" />
          <span className="sr-only">Mood Detection</span>
        </Button>
        <Button variant="secondary" className="text-secondary-foreground hover:bg-secondary/90">
          Login
        </Button>
      </div>
    </header>
  );
}