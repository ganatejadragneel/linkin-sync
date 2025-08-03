import React, { useEffect, useState } from 'react';
import { ArrowLeft, Music, Clock, ExternalLink, Play, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { UnifiedPlaylist, UnifiedTrack } from '../types';
import { spotifyApiService } from '../services/api/spotify.service';
import { youtubeApiService } from '../services/api/youtube.service';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

interface UnifiedPlaylistDetailProps {
  playlist: UnifiedPlaylist;
  onBack: () => void;
}

function getSourceIcon(source: 'spotify' | 'youtube') {
  return source === 'spotify' ? (
    <Music className="h-4 w-4 text-green-500" />
  ) : (
    <Youtube className="h-4 w-4 text-red-500" />
  );
}

function getSourceColor(source: 'spotify' | 'youtube') {
  return source === 'spotify' ? 'text-green-500' : 'text-red-500';
}

export function UnifiedPlaylistDetail({ playlist, onBack }: UnifiedPlaylistDetailProps) {
  const [tracks, setTracks] = useState<UnifiedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack } = useMusicPlayer();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let unifiedTracks: UnifiedTrack[] = [];

        if (playlist.source === 'spotify') {
          // Fetch Spotify tracks and convert to unified format
          const response = await spotifyApiService.getPlaylistTracks(playlist.id, 50);
          unifiedTracks = response.items
            .filter(item => item.track) // Filter out null tracks
            .map(item => {
              const track = item.track;
              return {
                id: track.id,
                name: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                album: track.album.name,
                duration: formatDuration(track.duration_ms),
                imageUrl: track.album.images && track.album.images.length > 0 
                  ? track.album.images[track.album.images.length - 1]?.url || null
                  : null,
                source: 'spotify' as const,
                externalUrl: track.external_urls.spotify,
                originalData: track,
              };
            });
        } else if (playlist.source === 'youtube') {
          // Fetch YouTube tracks (already in unified format)
          unifiedTracks = await youtubeApiService.getUnifiedPlaylistTracks(playlist.id);
        }

        setTracks(unifiedTracks);
      } catch (err: any) {
        setError(err.message || 'Failed to load playlist tracks');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [playlist.id, playlist.source]);

  const formatDuration = (durationMs: number): string => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-primary">Loading...</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading playlist tracks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-primary">Error</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Failed to Load Tracks</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex items-start gap-6 mb-8">
        <div className="w-48 h-48 bg-accent/10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
          {playlist.imageUrl ? (
            <img 
              src={playlist.imageUrl} 
              alt={`${playlist.name} playlist`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-24 h-24 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-primary">{playlist.name}</h1>
            {getSourceIcon(playlist.source)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(playlist.externalUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          
          {playlist.description && (
            <p className="text-muted-foreground mb-4">
              {playlist.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By {playlist.owner}</span>
            <span>•</span>
            <span>{playlist.trackCount} songs</span>
            <span>•</span>
            <span className={getSourceColor(playlist.source)}>
              {playlist.source === 'spotify' ? 'Spotify' : 'YouTube Music'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
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

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-3">
            {playlist.source === 'spotify' ? 'Album' : 'Channel'}
          </div>
          <div className="col-span-2 text-right">
            <Clock className="h-4 w-4 ml-auto" />
          </div>
        </div>
        
        {tracks.map((track, index) => (
          <div 
            key={track.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-accent/5 rounded-lg transition-colors group cursor-pointer"
            onClick={async () => {
              try {
                await playTrack(track, tracks);
              } catch (error) {
                console.error('Failed to play track:', error);
                setError(`Failed to play track: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}
          >
            <div className="col-span-1 flex items-center text-sm text-muted-foreground">
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="h-4 w-4 hidden group-hover:block" />
            </div>
            
            <div className="col-span-6 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-accent/10 rounded overflow-hidden flex-shrink-0">
                {track.imageUrl ? (
                  <img 
                    src={track.imageUrl} 
                    alt={track.album || track.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-6 h-6 text-muted-foreground m-2" />
                )}
              </div>
              
              <div className="min-w-0">
                <div className="font-medium text-primary truncate">{track.name}</div>
                <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                  <span>{track.artist}</span>
                  {getSourceIcon(track.source)}
                </div>
              </div>
            </div>
            
            <div className="col-span-3 flex items-center text-sm text-muted-foreground truncate">
              {track.album || 'N/A'}
            </div>
            
            <div className="col-span-2 flex items-center justify-end text-sm text-muted-foreground">
              {track.duration}
            </div>
          </div>
        ))}
      </div>
      
      {tracks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <Music className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">This playlist is empty</p>
        </div>
      )}

    </div>
  );
}