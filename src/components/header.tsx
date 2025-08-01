// Refactored Header component following Single Responsibility Principle

import { Button } from "./ui/button";
import { Camera } from 'lucide-react';
import { SearchBar } from './header/SearchBar';
import { UserMenu } from './header/UserMenu';
import { useUserProfile } from '../hooks/useUserProfile';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { userProfile, login, logout } = useUserProfile();

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/80 border-b border-border/50 relative z-[70]">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/LS_logo.png" 
            alt="Linkin Sync" 
            className="h-8 w-8"
          />
          <h1 className="text-2xl font-bold text-primary">Linkin Sync</h1>
        </div>
        <SearchBar onSearch={handleSearch} />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary/80 hover:text-primary hover:bg-accent/50"
        >
          <Camera className="h-5 w-5" />
          <span className="sr-only">Mood Detection</span>
        </Button>
        
        <UserMenu 
          userProfile={userProfile}
          onLogin={login}
          onLogout={logout}
        />
      </div>
    </header>
  );
}