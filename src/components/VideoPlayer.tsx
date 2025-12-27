
import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  controls?: boolean;
  autoplay?: boolean;
  className?: string;
  onReady?: (player: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  controls = true,
  autoplay = true,
  className = "",
  onReady
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      if (!videoRef.current) return;

      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, {
        controls,
        autoplay,
        poster,
        responsive: true,
        fluid: true,
        html5: {
          vhs: {
            overrideNative: true,
            limitRenditionByPlayerDimensions: true,
            useNetworkInformationApi: true,
            enableLowInitialPlaylist: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        }
      }, () => {
        console.log("Video Player is ready");
        if (onReady) {
          onReady(playerRef.current);
        }
      });
    }

    // Update the source whenever it changes
    if (playerRef.current) {
      playerRef.current.src({ src, type: getSourceType(src) });
      playerRef.current.load();
    }

    // Cleanup function to dispose the player when component unmounts
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, controls, autoplay, poster, onReady]);

  // Helper function to determine content type based on URL
  const getSourceType = (url: string): string => {
    if (url.includes('.m3u8')) return 'application/x-mpegURL';
    if (url.includes('.mpd')) return 'application/dash+xml';
    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.webm')) return 'video/webm';
    return 'application/x-mpegURL'; // Default to HLS
  };

  return (
    <div data-vjs-player className={className}>
      <div ref={videoRef} className="w-full h-full" />
    </div>
  );
};

export default VideoPlayer;
