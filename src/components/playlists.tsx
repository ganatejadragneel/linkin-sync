// Unified Playlists component supporting both Spotify and YouTube Music

import React, { useState } from 'react';
import { Music, Loader2, RefreshCw, ExternalLink, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { useUnifiedPlaylists } from '../hooks/useUnifiedPlaylists';
import { UnifiedPlaylist } from '../types';
import { UnifiedPlaylistDetail } from './unified-playlist-detail';

function getSourceIcon(source: 'spotify' | 'youtube') {
  return source === 'spotify' ? (
    <Music className="h-4 w-4 text-green-500" />
  ) : (
    <Youtube className="h-4 w-4 text-red-500" />
  );
}

export function Playlists() {
  const { 
    playlists, 
    loading, 
    error, 
    refetch, 
    isSpotifyAuthenticated,
    isYouTubeAuthenticated,
    hasAnyAuthentication 
  } = useUnifiedPlaylists();
  const [selectedPlaylist, setSelectedPlaylist] = useState<UnifiedPlaylist | null>(null);

  if (selectedPlaylist) {
    return (
      <UnifiedPlaylistDetail 
        playlist={selectedPlaylist} 
        onBack={() => setSelectedPlaylist(null)} 
      />
    );
  }

  if (!hasAnyAuthentication) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-primary">Your Playlists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Login Required</h3>
          <p className="text-muted-foreground mb-4">
            Please log in with Spotify or YouTube Music to view your playlists
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-green-500" />
              <span className={isSpotifyAuthenticated ? 'text-green-500' : ''}>
                Spotify {isSpotifyAuthenticated ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-500" />
              <span className={isYouTubeAuthenticated ? 'text-red-500' : ''}>
                YouTube Music {isYouTubeAuthenticated ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-primary">Your Playlists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your playlists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-primary">Your Playlists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Failed to Load Playlists</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-primary">Your Playlists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">No Playlists Found</h3>
          <p className="text-muted-foreground">
            You don't have any playlists yet. Create some in Spotify!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Your Playlists</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-green-500" />
              <span className={isSpotifyAuthenticated ? 'text-green-500' : ''}>
                Spotify {isSpotifyAuthenticated ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-500" />
              <span className={isYouTubeAuthenticated ? 'text-red-500' : ''}>
                YouTube Music {isYouTubeAuthenticated ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</span>
          <Button onClick={refetch} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {playlists.map((playlist) => {
          return (
            <div 
              key={`${playlist.source}-${playlist.id}`}
              className="w-full bg-card hover:bg-accent/5 rounded-lg p-4 transition-colors duration-200 cursor-pointer group"
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-accent/10 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                    {playlist.imageUrl ? (
                      <img 
                        src={playlist.imageUrl} 
                        alt={`${playlist.name} playlist`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Music className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-primary truncate">
                        {playlist.name}
                      </h3>
                      {getSourceIcon(playlist.source)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {playlist.description || `By ${playlist.owner}`}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded">
                        {playlist.source === 'spotify' ? 'Spotify' : 'YouTube Music'}
                      </span>
                      {playlist.isCollaborative && (
                        <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded">
                          Collaborative
                        </span>
                      )}
                      {!playlist.isPublic && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-primary flex-shrink-0">
                    {playlist.trackCount} song{playlist.trackCount !== 1 ? 's' : ''}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(playlist.externalUrl, '_blank');
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}