
import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    Clappr: any;
    DashShakaPlayback: any;
  }
}

interface ClapprPlayerProps {
  src: string;
  onReady?: (player: any) => void;
  className?: string;
  autoplay?: boolean;
}

const ClapprPlayer = ({ src, onReady, className, autoplay = true }: ClapprPlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const clapprInstance = useRef<any>(null);
  
  useEffect(() => {
    // Initialize Clappr Player
    if (!playerRef.current || !window.Clappr) return;
    
    // Detect file type
    const isDash = src.endsWith(".mpd");
    const isHls = src.endsWith(".m3u8");
    
    // DRM options for DASH content
    const shakaConfig = isDash ? {
      drm: {
        clearKeys: {
          "43d1c3b25207ff38b22ccfe17d302367": "7b1f85f6e81059473b114c16a25c829a"
        }
      }
    } : {};

    // Create player
    clapprInstance.current = new window.Clappr.Player({
      parentId: `#${playerRef.current.id}`,
      source: src,
      width: "100%",
      height: "100%",
      autoPlay: autoplay,
      mute: false,
      playback: {
        playInline: true
      },
      plugins: isDash ? [window.DashShakaPlayback] : [],
      shakaConfiguration: shakaConfig
    });
    
    // Add ready event
    if (onReady) {
      // Clappr doesn't have a direct "ready" event like JWPlayer,
      // so we use a small timeout to ensure the player is ready
      setTimeout(() => {
        if (onReady && clapprInstance.current) {
          onReady(clapprInstance.current);
        }
      }, 500);
    }
    
    // Cleanup on unmount
    return () => {
      if (clapprInstance.current) {
        clapprInstance.current.destroy();
      }
    };
  }, [src, onReady, autoplay]);
  
  // Update source if it changes
  useEffect(() => {
    if (clapprInstance.current && src) {
      clapprInstance.current.configure({
        source: src,
        autoPlay: autoplay
      });
    }
  }, [src, autoplay]);
  
  return <div 
    ref={playerRef} 
    id={`clappr-player-${Math.random().toString(36).substr(2, 9)}`} 
    className={`${className || ''} player-container`} 
  />;
};

export default ClapprPlayer;
