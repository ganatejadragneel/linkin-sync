import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { MessageSquare, Music, Users, Camera, PlaySquare, Search, Sparkles, Headphones, Globe, Shield, Heart, Star, TrendingUp, Wifi, Radio } from 'lucide-react';

export function About() {
  
  const features = [
    {
      id: 1,
      title: "Global Chat",
      description: "Connect with music enthusiasts worldwide in real-time.",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      stats: "10k+ active users"
    },
    {
      id: 2,
      title: "AI Lyric Assistant",
      description: "Understand the deeper meaning behind every song.",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      stats: "1M+ lyrics analyzed"
    },
    {
      id: 3,
      title: "Unified Player",
      description: "Seamless playback from Spotify and YouTube Music.",
      icon: Music,
      color: "from-green-500 to-emerald-500",
      stats: "Dual platform support"
    },
    {
      id: 4,
      title: "Mood Detection",
      description: "AI-powered mood analysis for perfect playlists.",
      icon: Camera,
      color: "from-orange-500 to-red-500",
      stats: "95% accuracy rate"
    },
    {
      id: 5,
      title: "Smart Playlists",
      description: "Organize your music across multiple platforms.",
      icon: PlaySquare,
      color: "from-indigo-500 to-purple-500",
      stats: "Unlimited playlists"
    },
    {
      id: 6,
      title: "Universal Search",
      description: "Find any song across all connected platforms.",
      icon: Search,
      color: "from-pink-500 to-rose-500",
      stats: "< 0.1s response time"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Songs Played", value: "10M+", icon: Headphones },
    { label: "Countries", value: "120+", icon: Globe },
    { label: "Uptime", value: "99.9%", icon: Shield },
  ];

  const roadmap = [
    { phase: "Phase 1", title: "Foundation", description: "Core music player and chat features", completed: true },
    { phase: "Phase 2", title: "Integration", description: "YouTube Music and enhanced AI features", completed: true },
    { phase: "Phase 3", title: "Social", description: "Friend system and collaborative playlists", completed: false },
    { phase: "Phase 4", title: "Discovery", description: "AI-powered music recommendations", completed: false },
  ];

  return (
    <div className="flex-1 bg-background text-foreground overflow-y-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Welcome to the future of music</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Linkin Sync
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Where music meets community. Experience your favorite tracks with integrated playback, 
              intelligent features, and a global network of music enthusiasts.
            </p>
            
            <div className="flex gap-4 justify-center pt-6">
              <Button className="bg-primary hover:bg-primary/90" size="lg">
                <Music className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
              <Button variant="outline" size="lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Stats
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <stat.icon className="w-8 h-8 mx-auto text-primary" />
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for the ultimate music experience, all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-all duration-300 blur-xl`} />
                
                <Card className="relative h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color} shadow-lg`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {feature.stats}
                      </span>
                    </div>
                    <CardTitle className="text-xl mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="py-20 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">
              Building the future of music streaming, one feature at a time.
            </p>
          </div>
          
          <div className="space-y-8">
            {roadmap.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.completed 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.completed ? (
                      <Star className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  {index < roadmap.length - 1 && (
                    <div className={`w-0.5 h-16 mt-2 ${
                      item.completed ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {item.phase}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <div className="relative text-center space-y-6">
              <Heart className="w-12 h-12 mx-auto text-primary animate-pulse" />
              <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of music lovers who are already experiencing the next generation of music streaming.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Wifi className="w-4 h-4 mr-2" />
                  Connect Spotify
                </Button>
                <Button size="lg" variant="outline">
                  <Radio className="w-4 h-4 mr-2" />
                  Connect YouTube
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}