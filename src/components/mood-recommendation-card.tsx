import { Play, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MoodBasedRecommendation } from '../types/chat';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

interface MoodRecommendationCardProps {
  recommendation: MoodBasedRecommendation;
  showMatchReason?: boolean;
}

export function MoodRecommendationCard({ 
  recommendation, 
  showMatchReason = false 
}: MoodRecommendationCardProps) {
  const { playTrack } = useMusicPlayer();
  
  const handlePlay = async () => {
    try {
      // Convert to UnifiedTrack format for the player
      const unifiedTrack = {
        id: recommendation.track.id,
        name: recommendation.track.name,
        artist: recommendation.track.artist,
        album: recommendation.track.album || '',
        duration: formatDuration(recommendation.track.duration || 0),
        imageUrl: recommendation.track.image_url || null,
        source: recommendation.track.source,
        externalUrl: recommendation.track.external_url || '',
        originalData: recommendation.track
      };
      
      await playTrack(unifiedTrack);
    } catch (error) {
      // Error will be handled by the parent component's error display
      console.error('Failed to play track from mood recommendation:', error);
    }
  };
  
  const formatDuration = (seconds: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getMoodScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <Card className="p-3 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Album Art or Music Icon */}
        <div className="w-12 h-12 bg-secondary rounded-md flex items-center justify-center flex-shrink-0">
          {recommendation.track.image_url ? (
            <img 
              src={recommendation.track.image_url} 
              alt={`${recommendation.track.album} cover`}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Music className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{recommendation.track.name}</h4>
          <p className="text-xs text-muted-foreground truncate">
            {recommendation.track.artist}
            {recommendation.track.album && ` • ${recommendation.track.album}`}
          </p>
          {showMatchReason && recommendation.match_reason && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              {recommendation.match_reason}
            </p>
          )}
        </div>
        
        {/* Mood Score */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className={`text-xs font-medium ${getMoodScoreColor(recommendation.mood_score)}`}>
              {Math.round(recommendation.mood_score * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">match</div>
          </div>
          
          {/* Play Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePlay}
            className="h-8 w-8"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}