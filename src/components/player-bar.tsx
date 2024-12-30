import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { FastForward, Pause, Rewind, Volume2 } from 'lucide-react';

export function PlayerBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 z-50">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md mb-4">
          <Slider defaultValue={[33]} max={100} step={1} className="accent-secondary" />
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <img
              src="/placeholder.svg"
              alt="Album cover"
              className="w-12 h-12 rounded"
            />
            <div>
              <h3 className="font-semibold text-secondary">Song Title</h3>
              <p className="text-sm text-muted-foreground">Artist Name</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-secondary hover:text-primary hover:bg-secondary">
              <Rewind className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary hover:text-primary hover:bg-secondary">
              <Pause className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary hover:text-primary hover:bg-secondary">
              <FastForward className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-secondary" />
            <Slider defaultValue={[66]} max={100} step={1} className="w-24 accent-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}