// Refactored Header component following Single Responsibility Principle

import { Button } from "./ui/button";
import { Camera, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { SearchBar } from './header/SearchBar';
import { UserMenu } from './header/UserMenu';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSpotifyDeviceStatus } from '../hooks/useSpotifyDeviceStatus';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { userProfile, login, logout } = useUserProfile();
  const { status: deviceStatus, isLoading: deviceLoading, activateDevice } = useSpotifyDeviceStatus();

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const getDeviceStatusIcon = () => {
    if (deviceLoading) return <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />;
    if (!deviceStatus.isConnected) return <WifiOff className="h-4 w-4" />;
    if (!deviceStatus.isActive) return <AlertCircle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getDeviceStatusColor = () => {
    if (!deviceStatus.isConnected) return 'text-red-500';
    if (!deviceStatus.isActive) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getDeviceStatusTooltip = () => {
    if (deviceStatus.error) return `Device Error: ${deviceStatus.error}`;
    if (!deviceStatus.isConnected) return 'Spotify device not connected';
    if (!deviceStatus.isActive) return 'Device connected but not active - click to activate';
    return `Active device: ${deviceStatus.deviceName}`;
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
        {userProfile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={`hover:bg-accent/50 ${getDeviceStatusColor()}`}
            onClick={activateDevice}
            title={getDeviceStatusTooltip()}
            disabled={deviceLoading}
          >
            {getDeviceStatusIcon()}
            <span className="sr-only">Spotify Device Status</span>
          </Button>
        )}
        
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