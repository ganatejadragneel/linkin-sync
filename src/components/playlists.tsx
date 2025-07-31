// Refactored Playlists component using real Spotify playlists

import React from 'react';
import { Music, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useSpotifyPlaylists } from '../hooks/useSpotifyPlaylists';
import { SpotifyPlaylist } from '../types';

const getPlaylistImage = (playlist: SpotifyPlaylist): string | null => {
  if (playlist.images && playlist.images.length > 0) {
    // Return the smallest image for better performance, or largest if no small one
    return playlist.images[playlist.images.length - 1]?.url || playlist.images[0]?.url;
  }
  return null;
};

const openSpotifyPlaylist = (playlist: SpotifyPlaylist) => {
  window.open(playlist.external_urls.spotify, '_blank');
};

export function Playlists() {
  const { playlists, loading, error, refetch, isAuthenticated } = useSpotifyPlaylists();

  if (!isAuthenticated) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-primary">Your Playlists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Login Required</h3>
          <p className="text-muted-foreground">
            Please log in with Spotify to view your playlists
          </p>
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
        <h2 className="text-2xl font-bold text-primary">Your Playlists</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</span>
          <Button onClick={refetch} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {playlists.map((playlist) => {
          const imageUrl = getPlaylistImage(playlist);
          
          return (
            <div 
              key={playlist.id}
              className="w-full bg-card hover:bg-accent/5 rounded-lg p-4 transition-colors duration-200 cursor-pointer group"
              onClick={() => openSpotifyPlaylist(playlist)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-accent/10 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
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
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {playlist.description || `By ${playlist.owner.display_name}`}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {playlist.collaborative && (
                        <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded">
                          Collaborative
                        </span>
                      )}
                      {!playlist.public && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-lg font-semibold text-primary flex-shrink-0 ml-4">
                  {playlist.tracks.total} song{playlist.tracks.total !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}