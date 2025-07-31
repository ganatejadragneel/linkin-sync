// Refactored Header component following Single Responsibility Principle

import { Button } from "./ui/button";
import { Camera } from 'lucide-react';
import { SearchBar } from './header/SearchBar';
import { UserMenu } from './header/UserMenu';
import { useUserProfile } from '../hooks/useUserProfile';

export function Header() {
  const { userProfile, login, logout } = useUserProfile();

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Search query:', query);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/80 border-b border-border/50">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-primary">Linkin Sync</h1>
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