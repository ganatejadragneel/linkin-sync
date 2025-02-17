import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageSquare, Music, Users, Camera, PlaySquare, Search } from 'lucide-react';

export function About() {
  const features = [
    {
      id: 1,
      title: "Global Chat",
      description: "Connect with other music enthusiasts in real-time through our global chat feature. Share your thoughts, discuss music, and make new friends who share your musical interests.",
      icon: Users
    },
    {
      id: 2,
      title: "Lyric Chat Assistant",
      description: "Get instant help with lyrics through our AI-powered Lyric Assistant. Ask questions, get explanations, and explore the meaning behind your favorite songs.",
      icon: MessageSquare
    },
    {
      id: 3,
      title: "Music Player",
      description: "Integrated Spotify playback with full control over your music. Play, pause, skip tracks, and adjust volume with our intuitive player interface.",
      icon: Music
    },
    {
      id: 4,
      title: "Mood Detection",
      description: "Advanced mood detection feature that can analyze and understand your emotional state to suggest appropriate music and create the perfect playlist for your current mood.",
      icon: Camera
    },
    {
      id: 5,
      title: "Custom Playlists",
      description: "Create and manage your own playlists. Organize your music library your way and keep track of your favorite songs from various artists.",
      icon: PlaySquare
    },
    {
      id: 6,
      title: "Search Functionality",
      description: "Powerful search feature to find your favorite songs, artists, and albums quickly. Get instant access to the music you love.",
      icon: Search
    }
  ];

  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-primary">About Linkin Sync</h2>
        <p className="text-lg mb-8 text-muted-foreground">
          Linkin Sync is a modern music platform that combines social features with an advanced music player, 
          providing a unique and interactive way to experience your favorite music. Whether you're looking to 
          discover new songs, connect with other music lovers, or get insights about lyrics, we've got you covered.
        </p>
        
        <h3 className="text-2xl font-semibold mb-6 text-primary">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.id} className="bg-card text-card-foreground hover:bg-accent transition-colors duration-200">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <feature.icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-card rounded-lg">
          <h3 className="text-2xl font-semibold mb-4 text-primary">Getting Started</h3>
          <p className="text-muted-foreground mb-4">
            To begin using Linkin Sync, simply log in with your Spotify account. This will give you access to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Full music playback functionality</li>
            <li>Custom playlist creation</li>
            <li>Chat features and community interaction</li>
            <li>Lyric assistance and mood detection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}