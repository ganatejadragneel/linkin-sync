import { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Camera, Search, LogOut, ChevronDown } from 'lucide-react';
import { initiateSpotifyLogin, getUserProfile } from '../utils/spotify-auth';
import { useClickOutside } from '../hooks/useClickOutside';

interface UserProfile {
  display_name?: string;
  email?: string;
}

export function Header() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(dropdownRef, () => setShowDropdown(false));

  useEffect(() => {
    const profile = localStorage.getItem('user_profile');
    if (profile) {
      try {
        setUserProfile(JSON.parse(profile));
      } catch (error) {
        console.error('Error parsing user profile:', error);
        localStorage.removeItem('user_profile');
      }
    }
  }, []);

  const handleLogin = async () => {
    await initiateSpotifyLogin();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('code_verifier');
    setUserProfile(null);
    setShowDropdown(false);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/80 border-b border-border/50">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-primary">Linkin Sync</h1>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 bg-muted/50 text-foreground placeholder:text-muted-foreground border-border/50 focus:border-primary/50"
          />
        </div>
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
        
        <div className="relative" ref={dropdownRef}>
          {userProfile ? (
            <>
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
            </>
          ) : (
            <Button 
              variant="outline" 
              className="border-primary/20 text-primary/90 hover:text-primary hover:bg-accent/50 hover:border-primary/50"
              onClick={handleLogin}
            >
              Login with Spotify
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}