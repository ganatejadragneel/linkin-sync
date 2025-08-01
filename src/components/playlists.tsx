import React, { useState } from 'react';
import { Music, Loader2, RefreshCw, ExternalLink, Youtube, Sparkles, ListMusic, Users, Lock, Globe, PlayCircle, Heart, BarChart3 } from 'lucide-react';
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
      <div className="flex-1 bg-background text-foreground overflow-y-auto">
        {/* Hero Section for Login Required */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-background to-background" />
          <div className="relative max-w-4xl mx-auto px-6 py-20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-500">Your Music Collections</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">
                Your Playlists
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect your music accounts to access all your playlists from Spotify and YouTube Music in one unified view.
              </p>
              
              <div className="flex gap-4 justify-center pt-6">
                <Button className="bg-green-500 hover:bg-green-600" size="lg" disabled={isSpotifyAuthenticated}>
                  <Music className="w-4 h-4 mr-2" />
                  {isSpotifyAuthenticated ? 'Spotify Connected' : 'Connect Spotify'}
                </Button>
                <Button className="bg-red-500 hover:bg-red-600" size="lg" disabled={isYouTubeAuthenticated}>
                  <Youtube className="w-4 h-4 mr-2" />
                  {isYouTubeAuthenticated ? 'YouTube Connected' : 'Connect YouTube'}
                </Button>
              </div>
              
              <div className="flex justify-center gap-8 pt-8">
                <div className="flex items-center gap-2 text-sm">
                  <Music className="h-4 w-4 text-green-500" />
                  <span className={isSpotifyAuthenticated ? 'text-green-500' : 'text-muted-foreground'}>
                    Spotify {isSpotifyAuthenticated ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span className={isYouTubeAuthenticated ? 'text-red-500' : 'text-muted-foreground'}>
                    YouTube Music {isYouTubeAuthenticated ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 bg-background text-foreground overflow-y-auto">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="relative max-w-4xl mx-auto px-6 py-20">
            <div className="text-center space-y-6">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
              <h2 className="text-2xl font-bold">Loading Your Music Library</h2>
              <p className="text-muted-foreground">Gathering playlists from your connected services...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-background text-foreground overflow-y-auto">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-background to-background" />
          <div className="relative max-w-4xl mx-auto px-6 py-20">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <ListMusic className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold">Unable to Load Playlists</h2>
              <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
              <Button onClick={refetch} size="lg" className="bg-primary hover:bg-primary/90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="flex-1 bg-background text-foreground overflow-y-auto">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="relative max-w-4xl mx-auto px-6 py-20">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Start Creating Playlists</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have any playlists yet. Create some in your connected music apps to see them here!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const spotifyPlaylists = playlists.filter(p => p.source === 'spotify');
  const youtubePlaylists = playlists.filter(p => p.source === 'youtube');
  const totalTracks = playlists.reduce((sum, playlist) => sum + playlist.trackCount, 0);

  return (
    <div className="flex-1 bg-background text-foreground overflow-y-auto">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ListMusic className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Your Playlists
                </h1>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{playlists.length} playlists • {totalTracks} total tracks</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Music className="h-3 w-3 text-green-500" />
                    <span className={isSpotifyAuthenticated ? 'text-green-500' : ''}>
                      Spotify {isSpotifyAuthenticated ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Youtube className="h-3 w-3 text-red-500" />
                    <span className={isYouTubeAuthenticated ? 'text-red-500' : ''}>
                      YouTube Music {isYouTubeAuthenticated ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={refetch} variant="outline" size="sm" className="hover:bg-primary/10">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-8 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <ListMusic className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-bold text-primary">{playlists.length}</div>
              <div className="text-sm text-muted-foreground">Total Playlists</div>
            </div>
            <div className="text-center space-y-2">
              <BarChart3 className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-bold text-primary">{totalTracks}</div>
              <div className="text-sm text-muted-foreground">Total Tracks</div>
            </div>
            <div className="text-center space-y-2">
              <Music className="w-8 h-8 mx-auto text-green-500" />
              <div className="text-2xl font-bold text-green-500">{spotifyPlaylists.length}</div>
              <div className="text-sm text-muted-foreground">Spotify</div>
            </div>
            <div className="text-center space-y-2">
              <Youtube className="w-8 h-8 mx-auto text-red-500" />
              <div className="text-2xl font-bold text-red-500">{youtubePlaylists.length}</div>
              <div className="text-sm text-muted-foreground">YouTube Music</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Playlists Grid */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => {
              return (
                <div key={`${playlist.source}-${playlist.id}`} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    playlist.source === 'spotify' ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-pink-500/20'
                  } opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300 blur-xl`} />
                  
                  <div 
                    className="relative h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-1 rounded-xl p-6"
                    onClick={() => setSelectedPlaylist(playlist)}
                  >
                    <div className="space-y-4">
                      {/* Playlist Image and Basic Info */}
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex-shrink-0">
                            {playlist.imageUrl ? (
                              <img 
                                src={playlist.imageUrl} 
                                alt={`${playlist.name} playlist`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <ListMusic className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            {getSourceIcon(playlist.source)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold text-primary truncate text-lg leading-tight">
                            {playlist.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {playlist.description || `By ${playlist.owner}`}
                          </p>
                        </div>
                      </div>

                      {/* Playlist Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4 text-primary" />
                          <span className="font-medium text-primary">
                            {playlist.trackCount} {playlist.trackCount === 1 ? 'song' : 'songs'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(playlist.externalUrl, '_blank');
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          playlist.source === 'spotify' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {playlist.source === 'spotify' ? 'Spotify' : 'YouTube Music'}
                        </span>
                        
                        {playlist.isCollaborative && (
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Collaborative
                          </span>
                        )}
                        
                        {playlist.isPublic ? (
                          <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Public
                          </span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}