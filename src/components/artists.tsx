import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronDown, ChevronUp, Loader2, Music, RefreshCw, Crown, ExternalLink, Sparkles, TrendingUp, Users, Award, Headphones, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useUnifiedArtists } from '../hooks/useUnifiedArtists';

const formatFollowers = (followers: number): string => {
  if (followers >= 1000000) {
    return `${(followers / 1000000).toFixed(1)}M`;
  } else if (followers >= 1000) {
    return `${(followers / 1000).toFixed(1)}K`;
  }
  return `${followers}`;
};

const getArtistImage = (artist: any): string | null => {
  if (artist.imageUrl) {
    return artist.imageUrl;
  }
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

export function Artists() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { artists, loading, error, refetch, hasAnyAuthentication, isSpotifyAuthenticated, isYouTubeAuthenticated } = useUnifiedArtists();

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (!hasAnyAuthentication) {
    return (
      <div className="flex-1 bg-background text-foreground overflow-y-auto">
        {/* Hero Section for Login Required */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-background to-background" />
          <div className="relative max-w-4xl mx-auto px-6 py-20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">Discover Your Musical DNA</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                Your Top Artists
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect your music accounts to discover your most-played artists and explore your unique music taste.
              </p>
              
              <div className="flex gap-4 justify-center pt-6">
                <Button className="bg-green-500 hover:bg-green-600" size="lg">
                  <Music className="w-4 h-4 mr-2" />
                  Connect Spotify
                </Button>
                <Button className="bg-red-500 hover:bg-red-600" size="lg">
                  <Users className="w-4 h-4 mr-2" />
                  Connect YouTube
                </Button>
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
              <h2 className="text-2xl font-bold">Analyzing Your Music Taste</h2>
              <p className="text-muted-foreground">Discovering your top artists from your listening history...</p>
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
                <Music className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold">Unable to Load Artists</h2>
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

  if (artists.length === 0) {
    return (
      <div className="flex-1 bg-background text-foreground overflow-y-auto">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="relative max-w-4xl mx-auto px-6 py-20">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Start Your Musical Journey</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Listen to more music on {isSpotifyAuthenticated && isYouTubeAuthenticated ? 'Spotify and YouTube Music' : isSpotifyAuthenticated ? 'Spotify' : 'YouTube Music'} to discover your top artists
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground overflow-y-auto">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Your Top Artists
                </h1>
              </div>
              <p className="text-muted-foreground">
                From {isSpotifyAuthenticated && isYouTubeAuthenticated ? 'Spotify & YouTube Music' : isSpotifyAuthenticated ? 'Spotify' : 'YouTube Music'} • {artists.length} artists discovered
              </p>
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
              <Award className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-bold text-primary">{artists.length}</div>
              <div className="text-sm text-muted-foreground">Top Artists</div>
            </div>
            <div className="text-center space-y-2">
              <Users className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-bold text-primary">
                {artists.reduce((sum, artist) => sum + (artist.followers || 0), 0) > 0 
                  ? formatFollowers(artists.reduce((sum, artist) => sum + (artist.followers || 0), 0))
                  : '∞'
                }
              </div>
              <div className="text-sm text-muted-foreground">Total Followers</div>
            </div>
            <div className="text-center space-y-2">
              <Music className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-bold text-primary">
                {new Set(artists.flatMap(artist => artist.genres || [])).size || 'Various'}
              </div>
              <div className="text-sm text-muted-foreground">Genres</div>
            </div>
            <div className="text-center space-y-2">
              <Star className="w-8 h-8 mx-auto text-primary" />
              <div className="text-2xl font-bold text-primary">
                {artists.length > 0 ? Math.round(artists.reduce((sum, artist) => sum + (artist.popularity || 0), 0) / artists.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Popularity</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Artists Grid */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artists.map((artist, index) => {
              const imageUrl = getArtistImage(artist);
              const isExpanded = expandedCard === artist.id;
              
              return (
                <div key={artist.id} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    artist.source === 'spotify' ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-pink-500/20'
                  } opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300 blur-xl`} />
                  
                  <Card 
                    className={`relative h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer ${
                      isExpanded ? 'ring-2 ring-primary/30 shadow-xl shadow-primary/20' : 'hover:-translate-y-1'
                    }`}
                    onClick={() => toggleCard(artist.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
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
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {index === 0 ? <Crown className="w-3 h-3" /> : index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg truncate">{artist.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  artist.source === 'spotify' 
                                    ? 'bg-green-500/10 text-green-500' 
                                    : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {getSourceLabel(artist.source)}
                                </span>
                                {artist.followers && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatFollowers(artist.followers)} followers
                                  </span>
                                )}
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                          
                          {artist.popularity && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Popularity</span>
                                <span>{artist.popularity}/100</span>
                              </div>
                              <div className="w-full bg-accent/20 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    artist.source === 'spotify' ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${artist.popularity}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {artist.genres && artist.genres.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-primary">Genres</h4>
                              <div className="flex flex-wrap gap-2">
                                {artist.genres.slice(0, 6).map((genre, genreIndex) => (
                                  <span 
                                    key={genreIndex}
                                    className="px-3 py-1 bg-primary/10 rounded-full text-xs text-primary border border-primary/20"
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                              One of your most listened artists
                            </div>
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openArtistLink(artist.externalUrl);
                              }}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Open in {getSourceLabel(artist.source)}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}