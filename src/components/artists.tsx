// src/components/artists.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronDown, ChevronUp, Loader2, Music, RefreshCw, Crown, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useUnifiedArtists } from '../hooks/useUnifiedArtists';

const formatFollowers = (followers: number): string => {
  if (followers >= 1000000) {
    return `${(followers / 1000000).toFixed(1)}M followers`;
  } else if (followers >= 1000) {
    return `${(followers / 1000).toFixed(1)}K followers`;
  }
  return `${followers} followers`;
};

const getArtistImage = (artist: any): string | null => {
  // For unified artists, use the imageUrl directly
  if (artist.imageUrl) {
    return artist.imageUrl;
  }
  // Fallback for legacy Spotify format
  if (artist.images && artist.images.length > 0) {
    const mediumImage = artist.images[1] || artist.images[0];
    return mediumImage?.url || null;
  }
  return null;
};

const openArtistLink = (url: string) => {
  window.open(url, '_blank');
};

const getSourceLabel = (source: 'spotify' | 'youtube') => {
  return source === 'spotify' ? 'Spotify' : 'YouTube';
};

const getSourceColor = (source: 'spotify' | 'youtube') => {
  return source === 'spotify' ? 'text-green-500' : 'text-red-500';
};

export function Artists() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { artists, loading, error, refetch, hasAnyAuthentication, isSpotifyAuthenticated, isYouTubeAuthenticated } = useUnifiedArtists();

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (!hasAnyAuthentication) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-primary">Your Top Artists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Login Required</h3>
          <p className="text-muted-foreground">
            Please log in with Spotify or YouTube Music to view your top artists
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-primary">Your Top Artists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading your top artists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-primary">Your Top Artists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Failed to Load Artists</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-primary">Your Top Artists</h2>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">No Top Artists Yet</h3>
          <p className="text-muted-foreground">
            Listen to more music on {isSpotifyAuthenticated && isYouTubeAuthenticated ? 'Spotify and YouTube Music' : isSpotifyAuthenticated ? 'Spotify' : 'YouTube Music'} to see your top artists here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary">Your Top Artists</h2>
          <p className="text-sm text-muted-foreground">
            From {isSpotifyAuthenticated && isYouTubeAuthenticated ? 'Spotify & YouTube Music' : isSpotifyAuthenticated ? 'Spotify' : 'YouTube Music'} - based on your recent listening
          </p>
        </div>
        <Button onClick={refetch} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto">
        {artists.map((artist, index) => {
          const imageUrl = getArtistImage(artist);
          
          return (
            <Card 
              key={artist.id} 
              className={`bg-card text-card-foreground hover:bg-accent/5 transition-all duration-300 cursor-pointer
                ${expandedCard === artist.id ? 'ring-1 ring-primary/20' : ''}`}
              onClick={() => toggleCard(artist.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-primary font-bold text-xs flex-shrink-0">
                    {index === 0 ? <Crown className="w-3 h-3" /> : index + 1}
                  </div>
                  <CardTitle className="text-base text-primary truncate">{artist.name}</CardTitle>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${artist.source === 'spotify' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {getSourceLabel(artist.source)}
                  </div>
                </div>
                {expandedCard === artist.id ? (
                  <ChevronUp className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-primary" />
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-3 mb-3">
                  <div className="relative w-16 h-16 rounded-md bg-accent/10 overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={artist.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Music className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      {artist.followers ? formatFollowers(artist.followers) : `Popular artist on ${getSourceLabel(artist.source)}`}
                    </p>
                    {artist.genres && artist.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {artist.genres.slice(0, 2).map((genre, genreIndex) => (
                          <span 
                            key={genreIndex}
                            className="px-2 py-0.5 bg-accent/10 rounded-full text-xs text-primary"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                    {artist.popularity && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Popularity: {artist.popularity}/100
                        </p>
                        <div className="w-full bg-accent/20 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${artist.popularity}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {expandedCard === artist.id && (
                  <div className="mt-3 space-y-3 border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-1">Artist Details</h3>
                        <p className="text-xs text-muted-foreground">
                          One of your most listened artists recently.
                        </p>
                      </div>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openArtistLink(artist.externalUrl);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-7"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open in {getSourceLabel(artist.source)}
                      </Button>
                    </div>

                    {artist.genres && artist.genres.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold mb-1 text-primary">All Genres</h4>
                        <div className="flex flex-wrap gap-1">
                          {artist.genres.map((genre, genreIndex) => (
                            <span 
                              key={genreIndex}
                              className="px-2 py-0.5 bg-primary/10 rounded-full text-xs text-primary border border-primary/20"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-semibold mb-2 text-primary">Statistics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-accent/10 rounded-md">
                          <p className="text-xs text-muted-foreground">Followers</p>
                          <p className="text-xs font-semibold text-primary">
                            {artist.followers ? formatFollowers(artist.followers) : 'N/A'}
                          </p>
                        </div>
                        <div className="p-2 bg-accent/10 rounded-md">
                          <p className="text-xs text-muted-foreground">Popularity</p>
                          <p className="text-xs font-semibold text-primary">{artist.popularity ? `${artist.popularity}/100` : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}