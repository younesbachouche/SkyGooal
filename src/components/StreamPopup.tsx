import React, { useEffect, useState, useMemo } from "react";
import { X, ExternalLink } from "lucide-react";

interface StreamPopupProps {
  streams: {
    english?: string;
    arabic?: string;
    server3?: string;
    server4?: string;
  };
  onClose: () => void;
}

const StreamPopup: React.FC<StreamPopupProps> = ({ streams, onClose }) => {
  // Filter out empty servers and create a clean list
  const availableServers = useMemo(() => {
    const servers: Array<{ key: string; url: string; label: string; isExternal?: boolean }> = [];
    
    if (streams.english?.trim()) {
      servers.push({ key: "english", url: streams.english.trim(), label: "Server 1" });
    }
    if (streams.arabic?.trim()) {
      servers.push({ key: "arabic", url: streams.arabic.trim(), label: "Server 2" });
    }
    if (streams.server3?.trim()) {
      servers.push({ key: "server3", url: streams.server3.trim(), label: "Server 3" });
    }
    if (streams.server4?.trim()) {
      servers.push({ 
        key: "server4", 
        url: streams.server4.trim(), 
        label: "Server 4", 
        isExternal: true 
      });
    }
    
    return servers;
  }, [streams]);

  const getFirstNonExternal = () => {
    return availableServers.find(s => !s.isExternal)?.key || "english";
  };

  const [active, setActive] = useState<string>(getFirstNonExternal());
  const [iframeKey, setIframeKey] = useState(Date.now());

  const activeServer = availableServers.find(s => s.key === active);
  const url = activeServer?.url || "";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    // Update active if current server is no longer available
    if (!activeServer && availableServers.length > 0) {
      const nonExternal = availableServers.find(s => !s.isExternal);
      if (nonExternal) {
        setActive(nonExternal.key);
      }
    }
  }, [activeServer, availableServers]);

  const handleServerChange = (serverKey: string) => {
    const server = availableServers.find(s => s.key === serverKey);
    if (!server) return;
    
    // Skip if same server
    if (serverKey === active) return;
    
    // If external server (server4), open in new tab and don't switch in popup
    if (server.isExternal) {
      window.open(server.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // For non-external servers, switch in the popup
    setActive(serverKey);
    setIframeKey(Date.now());
  };

  // Function to create autoplay URL
  const createAutoplayUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      
      // Add autoplay parameter for common streaming formats
      if (url.includes('.m3u8') || url.includes('.mpd') || url.includes('.mp4') || 
          url.includes('.m4v') || url.includes('.webm') || url.includes('.ogg')) {
        urlObj.searchParams.set('autoplay', '1');
      }
      
      // For iframe embeds (like YouTube, Vimeo)
      if (url.includes('youtube.com/embed') || url.includes('youtu.be') || 
          url.includes('vimeo.com') || url.includes('dailymotion.com')) {
        urlObj.searchParams.set('autoplay', '1');
      }
      
      // For direct video files
      if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) {
        return url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
      }
      
      return urlObj.toString();
    } catch {
      // If URL parsing fails, just return the original URL
      return url;
    }
  };

  if (availableServers.length === 0) {
    onClose();
    return null;
  }

  const isMobile = window.innerWidth < 768;
  const autoplayUrl = createAutoplayUrl(url);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-2 sm:p-4 
      bg-black/40 dark:bg-black/60 backdrop-blur-md dark:backdrop-blur-xl">
      {/* Blurred background overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-black/80 
          dark:from-slate-950/90 dark:via-slate-900/85 dark:to-black/90 
          backdrop-blur-xl dark:backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Close button - FLOATING ABOVE POPUP ON MOBILE */}
      {isMobile && (
        <button
          onClick={onClose}
          className="relative mb-2 z-50 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
            text-white p-3 rounded-full transition-all duration-200 shadow-xl shadow-red-500/30 
            backdrop-blur-sm border border-red-500/20"
        >
          <X size={26} />
        </button>
      )}

      <div className="relative w-full max-w-4xl 
        bg-white/95 dark:bg-slate-900/95 
        backdrop-blur-2xl dark:backdrop-blur-3xl
        rounded-2xl sm:rounded-3xl overflow-hidden 
        shadow-2xl border border-white/20 dark:border-slate-700/50
        ring-1 ring-white/10 dark:ring-slate-600/20">
        
        {!isMobile && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-50 
              bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
              text-white p-2 rounded-full transition-all duration-200 
              shadow-lg shadow-red-500/30 
              backdrop-blur-sm border border-red-500/20"
          >
            <X size={20} />
          </button>
        )}

        {/* Server buttons */}
        <div className="flex flex-wrap gap-2 p-3 sm:p-4 justify-center 
          bg-gradient-to-r from-slate-100/80 via-slate-200/80 to-slate-100/80
          dark:from-slate-800/90 dark:via-slate-900/90 dark:to-slate-800/90
          border-b border-slate-300/50 dark:border-slate-700/50 
          backdrop-blur-md dark:backdrop-blur-xl">
          {availableServers.map((server) => (
            <button
              key={server.key}
              onClick={() => handleServerChange(server.key)}
              className={`
                px-4 sm:px-5 py-2.5 sm:py-2.5 rounded-xl font-semibold transition-all duration-200
                backdrop-blur-sm
                ${active === server.key && !server.isExternal
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/40 scale-105 border border-red-500/30' 
                  : server.isExternal
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/30 border border-blue-500/30'
                  : 'bg-white/60 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 border border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500'
                }
                ${isMobile ? 'text-base min-w-[90px]' : 'text-sm min-w-[100px]'}
                flex items-center justify-center gap-2
              `}
            >
              {server.label}
              {server.isExternal && <ExternalLink size={isMobile ? 18 : 14} />}
            </button>
          ))}
        </div>

        {/* Stream Container - 16:9 Ratio */}
        {!activeServer?.isExternal && activeServer?.url && (
          <div className="relative w-full bg-black">
            <div 
              className="relative w-full mx-auto"
              style={{ 
                paddingBottom: '56.25%',
                maxWidth: isMobile ? '95vw' : '100%'
              }}
            >
              <iframe
                key={iframeKey}
                src={autoplayUrl}
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; web-share"
                allowFullScreen
                title="Live Stream"
                loading="eager"
                // Additional attributes for autoplay
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamPopup;
