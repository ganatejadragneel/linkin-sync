import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const albums = [
  {
    id: 1,
    title: "Midnights",
    artist: "Taylor Swift",
    year: "2022"
  },
  {
    id: 2,
    title: "Music of the Spheres",
    artist: "Coldplay",
    year: "2021"
  },
  {
    id: 3,
    title: "Minutes to Midnight",
    artist: "Linkin Park",
    year: "2007"
  },
  {
    id: 4,
    title: "1989 (Taylor's Version)",
    artist: "Taylor Swift",
    year: "2023"
  },
  {
    id: 5,
    title: "A Head Full of Dreams",
    artist: "Coldplay",
    year: "2015"
  },
  {
    id: 6,
    title: "Meteora",
    artist: "Linkin Park",
    year: "2003"
  }
];

export function MainContent() {
  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-primary">Featured Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <Card key={album.id} className="bg-card text-card-foreground hover:bg-accent transition-colors duration-200">
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
    </div>
  );
}