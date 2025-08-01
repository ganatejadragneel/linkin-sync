// UserMenu component - handles user authentication and dropdown

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { LogOut, ChevronDown, Music, Youtube } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { SpotifyUserProfile } from '../../types';
import { youtubeAuth } from '../../utils/youtube-auth';
import { storageService } from '../../services/storage.service';

interface UserMenuProps {
  userProfile: SpotifyUserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function UserMenu({ userProfile, onLogin, onLogout }: UserMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authOptionsRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(dropdownRef, () => setShowDropdown(false));
  useClickOutside(authOptionsRef, () => setShowAuthOptions(false));

  const isSpotifyAuthenticated = storageService.isAuthenticated();
  const isYouTubeAuthenticated = storageService.isYouTubeAuthenticated();
  const hasAnyAuthentication = isSpotifyAuthenticated || isYouTubeAuthenticated;

  const handleSpotifyLogout = () => {
    onLogout();
    setShowDropdown(false);
  };

  const handleYouTubeLogout = () => {
    youtubeAuth.logout();
    setShowDropdown(false);
    // Trigger a page refresh to update the auth state
    window.location.reload();
  };

  const handleYouTubeLogin = async () => {
    try {
      await youtubeAuth.initiateAuth();
    } catch (error) {
      console.error('YouTube login failed:', error);
    }
    setShowAuthOptions(false);
  };

  if (!hasAnyAuthentication) {
    return (
      <div className="relative" ref={authOptionsRef}>
        <Button 
          variant="outline" 
          className="border-primary/20 text-primary/90 hover:text-primary hover:bg-accent/50 hover:border-primary/50"
          onClick={() => setShowAuthOptions(!showAuthOptions)}
        >
          Login
        </Button>

        {showAuthOptions && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-xl bg-card border border-border z-[80] backdrop-blur-sm">
            <div className="py-1 rounded-md overflow-hidden">
              <button
                onClick={onLogin}
                className="w-full text-left px-4 py-3 text-sm text-card-foreground hover:bg-accent/50 hover:text-primary flex items-center gap-3 transition-colors duration-200"
              >
                <Music className="h-4 w-4 text-green-500" />
                Login with Spotify
              </button>
              <button
                onClick={handleYouTubeLogin}
                className="w-full text-left px-4 py-3 text-sm text-card-foreground hover:bg-accent/50 hover:text-primary flex items-center gap-3 transition-colors duration-200"
              >
                <Youtube className="h-4 w-4 text-red-500" />
                Login with YouTube Music
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        className="border-primary/20 text-primary/90 hover:text-primary hover:bg-accent/50 hover:border-primary/50 flex items-center gap-2"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {userProfile?.display_name || 'Account'}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-card border border-border z-[80]">
          <div className="py-1">
            {userProfile && (
              <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                {userProfile.email}
              </div>
            )}
            
            {/* Authentication Status */}
            <div className="px-4 py-2 border-b border-border">
              <div className="text-xs text-muted-foreground mb-2">Connected Services:</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Spotify</span>
                  </div>
                  <span className={`text-xs ${isSpotifyAuthenticated ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {isSpotifyAuthenticated ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span className="text-sm">YouTube Music</span>
                  </div>
                  <span className={`text-xs ${isYouTubeAuthenticated ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {isYouTubeAuthenticated ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Login Options */}
            {!isSpotifyAuthenticated && (
              <button
                onClick={onLogin}
                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-primary flex items-center gap-2"
              >
                <Music className="h-4 w-4 text-green-500" />
                Connect Spotify
              </button>
            )}
            
            {!isYouTubeAuthenticated && (
              <button
                onClick={handleYouTubeLogin}
                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-primary flex items-center gap-2"
              >
                <Youtube className="h-4 w-4 text-red-500" />
                Connect YouTube Music
              </button>
            )}

            {/* Logout Options */}
            {(isSpotifyAuthenticated || isYouTubeAuthenticated) && (
              <div className="border-t border-border">
                {isSpotifyAuthenticated && (
                  <button
                    onClick={handleSpotifyLogout}
                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-primary flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect Spotify
                  </button>
                )}
                
                {isYouTubeAuthenticated && (
                  <button
                    onClick={handleYouTubeLogout}
                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-primary flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect YouTube Music
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}