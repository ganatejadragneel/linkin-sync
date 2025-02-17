import React from 'react';
import { Music } from 'lucide-react';

interface Playlist {
  id: number;
  artist: string;
  lastPlayed: string;
  songCount: number;
  imageUrl: string;
}

const playlistsData: Playlist[] = [
  {
    id: 1,
    artist: "Linkin Park",
    lastPlayed: "In The End",
    songCount: 45,
    imageUrl: "/placeholder.svg" // Replace with actual album art
  },
  {
    id: 2,
    artist: "Coldplay",
    lastPlayed: "Fix You",
    songCount: 38,
    imageUrl: "/placeholder.svg" // Replace with actual album art
  },
  {
    id: 3,
    artist: "Taylor Swift",
    lastPlayed: "Anti-Hero",
    songCount: 52,
    imageUrl: "/placeholder.svg" // Replace with actual album art
  }
];

export function Playlists() {
  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">Your Playlists</h2>
      <div className="space-y-4">
        {playlistsData.map((playlist) => (
          <div 
            key={playlist.id}
            className="w-full bg-card hover:bg-accent/5 rounded-lg p-4 transition-colors duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-accent/10 rounded-md overflow-hidden flex items-center justify-center">
                  {playlist.imageUrl ? (
                    <img 
                      src={playlist.imageUrl} 
                      alt={`${playlist.artist} playlist`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-primary">
                    {playlist.artist} Playlist
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last played: {playlist.lastPlayed}
                  </p>
                </div>
              </div>
              <div className="text-lg font-semibold text-primary">
                {playlist.songCount} songs
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}