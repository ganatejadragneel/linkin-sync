// src/components/artists.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getArtistImage } from '../utils/spotify-auth';
import { storageService } from '../services/storage.service';

interface Artist {
  id: number;
  name: string;
  imageUrl: string;
  debutYear: string;
  shortInfo: string;
  genres: string[];
  biography: string;
  achievements: string[];
  popularAlbums: Array<{
    name: string;
    year: string;
  }>;
}

interface ArtistWithImage extends Artist {
  spotifyImageUrl?: string | null;
  imageLoading?: boolean;
}

const artistsData: Artist[] = [
  {
    id: 1,
    name: "Coldplay",
    imageUrl: "/placeholder.svg",
    debutYear: "1996",
    shortInfo: "British rock band formed in London",
    genres: ["Alternative Rock", "Pop Rock", "Art Pop", "Pop"],
    biography: "Coldplay formed at University College London by Chris Martin and Jonny Buckland. With over 100 million albums sold worldwide, they've evolved from alternative rock to more experimental and pop-oriented sounds. Known for their spectacular live performances and innovative music videos.",
    achievements: [
      "7 Grammy Awards",
      "9 Brit Awards",
      "7 Billboard Music Awards",
      "Over 100 million records sold worldwide"
    ],
    popularAlbums: [
      { name: "Parachutes", year: "2000" },
      { name: "A Rush of Blood to the Head", year: "2002" },
      { name: "Viva la Vida", year: "2008" }
    ]
  },
  {
    id: 2,
    name: "Taylor Swift",
    imageUrl: "/placeholder.svg",
    debutYear: "2006",
    shortInfo: "American singer-songwriter who transformed from country to pop superstar",
    genres: ["Pop", "Country", "Folk", "Alternative"],
    biography: "Taylor Swift began her career as a country music singer at age 16. She has since evolved into one of the world's best-selling music artists, successfully transitioning from country to pop music. Known for her narrative songwriting and artistic reinventions.",
    achievements: [
      "12 Grammy Awards",
      "40+ Guinness World Records",
      "Billboard's Woman of the Decade (2010s)",
      "Most streamed female artist on Spotify"
    ],
    popularAlbums: [
      { name: "Fearless", year: "2008" },
      { name: "1989", year: "2014" },
      { name: "Folklore", year: "2020" }
    ]
  },
  {
    id: 3,
    name: "Linkin Park",
    imageUrl: "/placeholder.svg",
    debutYear: "1996",
    shortInfo: "American rock band known for blending rock and hip-hop",
    genres: ["Alternative Rock", "Nu Metal", "Electronic Rock", "Rap Rock"],
    biography: "Linkin Park revolutionized the rock genre by combining heavy guitars with hip-hop elements. Formed in California, they became one of the best-selling bands of the 21st century. Their debut album 'Hybrid Theory' is among the best-selling debuts of all time.",
    achievements: [
      "2 Grammy Awards",
      "6 American Music Awards",
      "Over 100 million records sold worldwide",
      "First rock band to achieve more than 1 billion YouTube views"
    ],
    popularAlbums: [
      { name: "Hybrid Theory", year: "2000" },
      { name: "Meteora", year: "2003" },
      { name: "Minutes to Midnight", year: "2007" }
    ]
  }
];

export function Artists() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [artistsWithImages, setArtistsWithImages] = useState<ArtistWithImage[]>(
    artistsData.map(artist => ({
      ...artist,
      imageLoading: true,
      spotifyImageUrl: null
    }))
  );

  useEffect(() => {
    const fetchArtistImages = async () => {
      // Fetch images for each artist
      const imagePromises = artistsData.map(async (artist, index) => {
        try {
          const imageUrl = await getArtistImage(artist.name);
          return { index, imageUrl };
        } catch (error) {
          console.error(`Failed to fetch image for ${artist.name}:`, error);
          return { index, imageUrl: null };
        }
      });

      const results = await Promise.all(imagePromises);
      
      // Update state with fetched images
      setArtistsWithImages(prevArtists => 
        prevArtists.map((artist, index) => {
          const result = results.find(r => r.index === index);
          return {
            ...artist,
            imageLoading: false,
            spotifyImageUrl: result?.imageUrl || null
          };
        })
      );
    };

    // Check if user is authenticated before fetching
    if (storageService.isAuthenticated()) {
      fetchArtistImages();
    } else {
      // If not authenticated, just set loading to false
      setArtistsWithImages(prevArtists => 
        prevArtists.map(artist => ({
          ...artist,
          imageLoading: false
        }))
      );
    }
  }, []);

  const toggleCard = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">Featured Artists</h2>
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {artistsWithImages.map((artist) => (
          <Card 
            key={artist.id} 
            className={`bg-card text-card-foreground hover:bg-accent/5 transition-all duration-300 cursor-pointer
              ${expandedCard === artist.id ? 'ring-1 ring-primary/20' : ''}`}
            onClick={() => toggleCard(artist.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-primary">{artist.name}</CardTitle>
              {expandedCard === artist.id ? (
                <ChevronUp className="h-5 w-5 text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-primary" />
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative w-full h-48 rounded-md bg-accent/10 overflow-hidden">
                  {artist.imageLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <img 
                      src={artist.spotifyImageUrl || artist.imageUrl} 
                      alt={artist.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Only set to placeholder if it's not already the placeholder
                        if (!target.src.includes('placeholder.svg')) {
                          target.src = '/placeholder.svg';
                        }
                      }}
                    />
                  )}
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground mb-2">{artist.shortInfo}</p>
                  <p className="text-muted-foreground">Debut: {artist.debutYear}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {artist.genres.map((genre, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-accent/10 rounded-full text-sm text-primary"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {expandedCard === artist.id && (
                <div className="mt-6 space-y-4 border-t border-border pt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-primary">Biography</h3>
                    <p className="text-muted-foreground">{artist.biography}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-primary">Notable Achievements</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {artist.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-primary">Popular Albums</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {artist.popularAlbums.map((album, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-accent/10 rounded-md"
                        >
                          <p className="font-medium text-primary">{album.name}</p>
                          <p className="text-sm text-muted-foreground">{album.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}