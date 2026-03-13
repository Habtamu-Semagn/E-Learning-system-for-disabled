'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        {src ? (
          <video
            ref={videoRef}
            className="w-full h-full"
            aria-label={title}
          >
            <source src={src} type="video/mp4" />
            <track kind="captions" label="English captions" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-white text-center p-8">
            <Play className="h-16 w-16 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p className="text-lg">Video will be displayed here</p>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div 
        className="bg-gray-800 p-4 flex items-center gap-4"
        role="toolbar"
        aria-label="Video controls"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="text-white hover:bg-gray-700"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Play className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-white hover:bg-gray-700"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Volume2 className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>

        <div className="flex-1 bg-gray-700 h-1 rounded-full">
          <div className="bg-blue-500 h-1 rounded-full w-1/3" role="progressbar" aria-valuenow={33} aria-valuemin={0} aria-valuemax={100} />
        </div>

        <span className="text-white text-sm" aria-live="polite">0:00 / 10:00</span>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-700"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-700"
          aria-label="Fullscreen"
        >
          <Maximize className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
