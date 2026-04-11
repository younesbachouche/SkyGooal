import React, { useEffect, useState, useMemo } from "react";
import { X, ExternalLink } from "lucide-react";
import JWPlayer from "./JWPlayer";

interface StreamPopupProps {
  streams: {
    english?: string;
    arabic?: string;
    server3?: string;
    server4?: string;
    pc?: string;
  };
  onClose: () => void;
}

const StreamPopup: React.FC<StreamPopupProps> = ({ streams, onClose }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter out empty servers and create a clean list
  const availableServers = useMemo(() => {
    const servers: Array<{ 
      key: string; 
      url: string; 
      label: string; 
      isExternal?: boolean;
      isDesktopOnly?: boolean;
      isM3u8?: boolean;
    }> = [];
    
    // Check if URL is m3u8 (any protocol)
    const isM3u8Link = (url: string) => {
      return url?.includes(".m3u8");
    };

    // Only add servers that are m3u8 or server4 (external)
    if (streams.english?.trim()) {
      const url = streams.english.trim();
      if (isM3u8Link(url)) {
        servers.push({ 
          key: "english", 
          url: url, 
          label: "English", 
          isM3u8: true
        });
      }
    }
    if (streams.arabic?.trim()) {
      const url = streams.arabic.trim();
      if (isM3u8Link(url)) {
        servers.push({ 
          key: "arabic", 
          url: url, 
          label: "Arabic", 
          isM3u8: true
        });
      }
    }
    if (streams.server3?.trim()) {
      const url = streams.server3.trim();
      if (isM3u8Link(url)) {
        servers.push({ 
          key: "server3", 
          url: url, 
          label: "Server 3", 
          isM3u8: true
        });
      }
    }
    // Server 4 - always show as external link
    if (streams.server4?.trim()) {
      servers.push({ 
        key: "server4", 
        url: streams.server4.trim(), 
        label: "Server 4", 
        isExternal: true,
        isM3u8: false
      });
    }
    // PC server - only available on desktop and m3u8
    if (streams.pc?.trim() && !isMobile) {
      const url = streams.pc.trim();
      if (isM3u8Link(url)) {
        servers.push({ 
          key: "pc", 
          url: url, 
          label: "PC", 
          isDesktopOnly: true,
          isM3u8: true
        });
      }
    }
    
    return servers;
  }, [streams, isMobile]);

  const getFirstM3u8 = () => {
    return availableServers.find(s => s.isM3u8)?.key || availableServers[0]?.key || "english";
  };

  const [active, setActive] = useState<string>(getFirstM3u8());

  const activeServer = availableServers.find(s => s.key === active);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    // Update active if current server is no longer available
    if (!activeServer && availableServers.length > 0) {
      const firstM3u8 = availableServers.find(s => s.isM3u8);
      if (firstM3u8) {
        setActive(firstM3u8.key);
      }
    }
  }, [activeServer, availableServers]);

  const handleServerChange = (serverKey: string) => {
    const server = availableServers.find(s => s.key === serverKey);
    if (!server) return;
    
    // If external server, open in new tab
    if (server.isExternal) {
      window.open(server.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Skip if same server
    if (serverKey === active) return;
    
    // Switch server
    setActive(serverKey);
  };

  if (availableServers.length === 0) {
    onClose();
    return null;
  }

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
            backdrop-blur-sm border border-red-500/20 hover:scale-110 transform"
          title="Close Stream"
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
              backdrop-blur-sm border border-red-500/20 hover:scale-110 transform"
            title="Close Stream"
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
                backdrop-blur-sm whitespace-nowrap
                ${server.isExternal
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/30 border border-blue-500/30'
                  : active === server.key
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/40 scale-105 border border-red-500/30' 
                  : 'bg-white/60 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700 border border-slate-300/50 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500'
                }
                ${isMobile ? 'text-sm min-w-[80px]' : 'text-sm min-w-[100px]'}
                flex items-center justify-center gap-2 hover:scale-105 transform
              `}
              title={server.isDesktopOnly ? "Desktop only" : server.isExternal ? "Opens in new tab" : ""}
            >
              {server.label}
              {server.isExternal && <ExternalLink size={14} />}
            </button>
          ))}
        </div>

        {/* JW Player Stream Container - 16:9 Ratio */}
        {activeServer?.url && !activeServer.isExternal && (
          <div className="relative w-full bg-black">
            <div 
              className="relative w-full mx-auto"
              style={{ 
                paddingBottom: '56.25%'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full">
                <JWPlayer 
                  key={`${activeServer.key}-${activeServer.url}`}
                  src={activeServer.url}
                  autoplay={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamPopup;

