import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function MainContent() {
  return (
    <div className="flex-1 p-6 bg-background text-foreground overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-primary">Featured Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="bg-card text-card-foreground hover:bg-accent transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-primary">Album Title {item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Artist Name</p>
              <p className="text-muted-foreground">Release Year: 2023</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}