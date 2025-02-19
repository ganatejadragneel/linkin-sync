// src/components/album-details.tsx
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Clock, Play } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
}

interface AlbumDetailsProps {
  album: {
    name: string;
    artists: Array<{ name: string }>;
    release_date: string;
    total_tracks: number;
    tracks: {
      items: Track[];
    };
  };
  onClose: () => void;
}

const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
};

export function AlbumDetails({ album, onClose }: AlbumDetailsProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl my-8 mb-32">
          <Card className="w-full">
            <CardHeader className="relative sticky top-0 bg-card z-10 border-b">
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 text-muted-foreground hover:text-primary"
              >
                ✕
              </button>
              <CardTitle className="text-2xl font-bold text-primary">
                {album.name}
              </CardTitle>
              <div className="text-muted-foreground">
                {album.artists.map(artist => artist.name).join(', ')} • {album.release_date.split('-')[0]} • {album.total_tracks} tracks
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-accent/50 sticky top-0">
                    <tr>
                      <th scope="col" className="py-3 px-4 w-16">#</th>
                      <th scope="col" className="py-3 px-4">Title</th>
                      <th scope="col" className="py-3 px-4 text-right w-20">
                        <Clock className="h-4 w-4 inline-block" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {album.tracks.items.map((track) => (
                      <tr 
                        key={track.id} 
                        className="border-b border-accent/20 hover:bg-accent/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-primary">
                          {track.track_number}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Play className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                            <span className="text-primary">{track.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-muted-foreground">
                          {formatDuration(track.duration_ms)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}