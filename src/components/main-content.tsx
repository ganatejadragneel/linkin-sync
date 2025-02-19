import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlbumDetails } from './album-details';
import { getAlbumDetails, initiateSpotifyLogin } from '../utils/spotify-auth';
import { Loader2 } from 'lucide-react';

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

export function MainContent() {
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAlbumClick = async (album: any) => {
    // Check if user is logged in
    if (!localStorage.getItem('access_token')) {
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

  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-primary">Featured Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <Card 
            key={album.id} 
            className="bg-card text-card-foreground hover:bg-accent transition-colors duration-200 cursor-pointer"
            onClick={() => handleAlbumClick(album)}
          >
            <CardHeader>
              <CardTitle className="text-primary">{album.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-medium">{album.artist}</p>
              <p className="text-muted-foreground">Release Year: {album.year}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
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