// UserMenu component - handles user authentication and dropdown

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { LogOut, ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { SpotifyUserProfile } from '../../types';

interface UserMenuProps {
  userProfile: SpotifyUserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function UserMenu({ userProfile, onLogin, onLogout }: UserMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleLogout = () => {
    onLogout();
    setShowDropdown(false);
  };

  if (!userProfile) {
    return (
      <Button 
        variant="outline" 
        className="border-primary/20 text-primary/90 hover:text-primary hover:bg-accent/50 hover:border-primary/50"
        onClick={onLogin}
      >
        Login with Spotify
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        className="border-primary/20 text-primary/90 hover:text-primary hover:bg-accent/50 hover:border-primary/50 flex items-center gap-2"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {userProfile.display_name}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
              {userProfile.email}
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-primary flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}