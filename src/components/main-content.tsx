import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlbumDetails } from './album-details';
import { getAlbumDetails, initiateSpotifyLogin } from '../utils/spotify-auth';
import { storageService } from '../services/storage.service';
import { spotifyApiService } from '../services/api/spotify.service';
import { youtubeApiService } from '../services/api/youtube.service';
import { UnifiedTrack } from '../types';
import { useUnifiedPlaylists } from '../hooks/useUnifiedPlaylists';
import { Loader2, Play, Music, Sparkles, Star, TrendingUp } from 'lucide-react';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

const albums = [
  {
    id: 1,
    title: "Midnights",
    artist: "Taylor Swift",
    year: "2022",
    spotifyId: "151w1FgRZfnKZA9FEcg9Z3"
  },
  {
    id: 2,
    title: "Music of the Spheres",
    artist: "Coldplay",
    year: "2021",
    spotifyId: "06mXfvDsRZNfnsGZvX2zpb"
  },
  {
    id: 3,
    title: "Minutes to Midnight",
    artist: "Linkin Park",
    year: "2007",
    spotifyId: "2tlTBLz2w52rpGCLBGyGw6"
  },
  {
    id: 4,
    title: "1989 (Taylor's Version)",
    artist: "Taylor Swift",
    year: "2023",
    spotifyId: "64LU4c1nfjz1t4VnGhagcg"
  },
  {
    id: 5,
    title: "A Head Full of Dreams",
    artist: "Coldplay",
    year: "2015",
    spotifyId: "3cfAM8b8KqJRoIzt3zLKqw"
  },
  {
    id: 6,
    title: "Meteora",
    artist: "Linkin Park",
    year: "2003",
    spotifyId: "0y13VbGddQ4azdVWakksAL"
  }
];

interface MainContentProps {
  searchQuery?: string;
  searchType?: 'general' | 'song-request';
  isSearchingPlaylists?: boolean;
}

export function MainContent({ searchQuery, searchType = 'general', isSearchingPlaylists = false }: MainContentProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<UnifiedTrack[]>([]);
  const { playTrack } = useMusicPlayer();
  const spotifyLoggedIn = !!storageService.getAccessToken();
  const youtubeLoggedIn = !!storageService.getYouTubeAccessToken();
  const { playlists, loading: playlistsLoading } = useUnifiedPlaylists();

  const handleAlbumClick = async (album: any) => {
    // Check if user is logged in
    if (!storageService.getAccessToken()) {
      setError('Please log in to view album details');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const albumData = await getAlbumDetails(album.spotifyId);
      setSelectedAlbum(albumData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch album details';
      setError(errorMessage);
      
      // If the error is authentication-related, show login button
      if (errorMessage.includes('log in')) {
        setError('Please log in to continue');
      }
      
      console.error('Error fetching album details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    initiateSpotifyLogin();
  };

  // Handle search when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      if (searchType === 'song-request') {
        performPlaylistSearch(searchQuery);
      } else {
        performSearch(searchQuery);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchType]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    const results: UnifiedTrack[] = [];

    try {
      // Search Spotify if logged in
      if (spotifyLoggedIn) {
        try {
          const spotifyTracks = await spotifyApiService.searchTracks(query);
          const unifiedSpotifyTracks: UnifiedTrack[] = spotifyTracks.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            album: track.album?.name,
            duration: track.duration_ms?.toString() || '0',
            imageUrl: track.album?.images?.[0]?.url || null,
            source: 'spotify' as const,
            externalUrl: track.external_urls?.spotify || '',
            originalData: track,
          }));
          results.push(...unifiedSpotifyTracks);
        } catch (spotifyError) {
          console.error('Spotify search error:', spotifyError);
        }
      }

      // Search YouTube if logged in
      if (youtubeLoggedIn) {
        try {
          const youtubeTracks = await youtubeApiService.searchTracks(query);
          results.push(...youtubeTracks);
        } catch (youtubeError) {
          console.error('YouTube search error:', youtubeError);
        }
      }

      // Alternate results between Spotify and YouTube
      const alternatedResults: UnifiedTrack[] = [];
      const spotifyResults = results.filter(track => track.source === 'spotify');
      const youtubeResults = results.filter(track => track.source === 'youtube');
      const maxLength = Math.max(spotifyResults.length, youtubeResults.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < spotifyResults.length) {
          alternatedResults.push(spotifyResults[i]);
        }
        if (i < youtubeResults.length) {
          alternatedResults.push(youtubeResults[i]);
        }
      }

      setSearchResults(alternatedResults);

      if (alternatedResults.length === 0 && (spotifyLoggedIn || youtubeLoggedIn)) {
        setError('No results found for your search.');
      } else if (!spotifyLoggedIn && !youtubeLoggedIn) {
        setError('Please log in to Spotify or YouTube to search for music.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performPlaylistSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    const results: UnifiedTrack[] = [];

    try {
      // Search through user's playlists first
      for (const playlist of playlists) {
        try {
          let playlistTracks: any[] = [];
          
          if (playlist.source === 'spotify') {
            // Get Spotify playlist tracks
            const tracksResponse = await spotifyApiService.getPlaylistTracks(playlist.id, 50);
            playlistTracks = tracksResponse.items
              .map(item => item.track)
              .filter(track => track && track.name && track.artists);
          } else if (playlist.source === 'youtube') {
            // Get YouTube playlist tracks (if API supports it)
            // TODO: Implement YouTube playlist tracks fetching if available
            continue; // Skip for now
          }

          // Search for matching tracks in this playlist
          const matchingTracks = playlistTracks.filter(track => {
            const trackName = track.name.toLowerCase();
            const artistName = track.artists[0]?.name?.toLowerCase() || '';
            const searchLower = query.toLowerCase();
            
            // Fuzzy matching - check if search terms are contained in track name or artist
            return trackName.includes(searchLower) || 
                   artistName.includes(searchLower) ||
                   searchLower.includes(trackName) ||
                   searchLower.includes(artistName);
          });

          // Convert to UnifiedTrack format
          const unifiedTracks: UnifiedTrack[] = matchingTracks.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            album: track.album?.name,
            duration: track.duration_ms?.toString() || '0',
            imageUrl: track.album?.images?.[0]?.url || null,
            source: playlist.source as 'spotify' | 'youtube',
            externalUrl: track.external_urls?.spotify || '',
            originalData: { ...track, playlistName: playlist.name }, // Store playlist context in originalData
          }));

          results.push(...unifiedTracks);
        } catch (playlistError) {
          console.error(`Error searching playlist ${playlist.name}:`, playlistError);
        }
      }

      // Limit to 20 results as specified
      const limitedResults = results.slice(0, 20);
      setSearchResults(limitedResults);

      if (limitedResults.length === 0) {
        // If no results in playlists, fall back to general search
        setError(`No matches found in your playlists. Searching the catalog...`);
        await performSearch(query);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Playlist search error:', err);
      setError('Failed to search playlists. Trying general search...');
      // Fallback to general search
      await performSearch(query);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackPlay = async (track: UnifiedTrack) => {
    try {
      await playTrack(track);
    } catch (error) {
      console.error('Failed to play track:', error);
      setError(`Failed to play track: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-primary">
        {searchQuery 
          ? searchType === 'song-request' 
            ? `Found songs for "${searchQuery}"` 
            : `Results for "${searchQuery}"`
          : 'Featured Content'
        }
      </h2>
      {searchQuery ? (
        // Search Results View
        <div className="space-y-4">
          {searchResults.map((track, index) => (
            <div
              key={`${track.source}-${track.id}-${index}`}
              className="flex items-center gap-4 p-4 bg-card rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleTrackPlay(track)}
            >
              <div className="w-16 h-16 bg-accent/10 rounded-md overflow-hidden flex-shrink-0">
                {track.imageUrl ? (
                  <img 
                    src={track.imageUrl} 
                    alt={track.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-primary truncate">{track.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                {track.album && (
                  <p className="text-xs text-muted-foreground/70 truncate">{track.album}</p>
                )}
                {searchType === 'song-request' && track.originalData?.playlistName && (
                  <p className="text-xs text-blue-500/70 truncate">From playlist: {track.originalData.playlistName}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  track.source === 'spotify' 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {track.source === 'spotify' ? 'Spotify' : 'YouTube'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackPlay(track);
                  }}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Featured Albums View
        <div>
          {/* Hero Section for Featured Content */}
          <div className="relative overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
            <div className="relative max-w-6xl mx-auto px-6 py-16">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Handpicked for You</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Featured Albums
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover exceptional music from legendary artists. Explore these carefully curated albums that have shaped the music landscape.
                </p>
              </div>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album) => (
                <div key={album.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300 blur-xl" />
                  
                  <Card 
                    className="relative h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-2"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <CardHeader className="pb-4">
                      <div className="aspect-square w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-16 h-16 text-primary/40" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary transition-all duration-300">
                        {album.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Music className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-primary">{album.artist}</p>
                            <p className="text-sm text-muted-foreground">Artist</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-accent-foreground">{album.year}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">Release Year</span>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlbumClick(album);
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>

                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Click to explore tracks</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              <span className="text-yellow-500">Featured</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <div className="relative text-center space-y-6">
                <TrendingUp className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-3xl font-bold">Discover More Music</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Connect your Spotify account to unlock personalized recommendations, create playlists, and enjoy seamless music streaming.
                </p>
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  <Music className="w-4 h-4 mr-2" />
                  Connect Spotify
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex justify-end space-x-4">
              {error.includes('log in') && (
                <button 
                  onClick={handleLogin}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Login with Spotify
                </button>
              )}
              <button 
                onClick={() => setError(null)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {selectedAlbum && (
        <AlbumDetails 
          album={selectedAlbum} 
          onClose={() => setSelectedAlbum(null)} 
        />
      )}
    </div>
  );
}