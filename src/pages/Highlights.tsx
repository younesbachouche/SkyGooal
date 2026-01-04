import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Calendar, Moon, Sun, RefreshCw, Filter, ChevronRight } from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";

// YouTube API Key
const YOUTUBE_API_KEY = "AIzaSyDmHS6Thxuzhl_CdmzDCJRnI1rZEBscrcQ";

// League configurations
const LEAGUES = [
  {
    id: "champions-league",
    name: "Champions League",
    logo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
    playlistId: "PLczz3UIGL1XqcsCYv0UHuSBnNqdxQKe--",
    color: "#1E3A8A",
    description: "UEFA Champions League Highlights"
  },
  {
    id: "serie-a",
    name: "Serie A",
    logo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
    playlistId: "PLSzTvlmsNKDA-99fKZ2pmLFfnqEpzOrnY",
    color: "#047857",
    description: "Italian Serie A Highlights"
  }
];

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  videoId: string;
}

interface PlaylistVideosResponse {
  items: Array<{
    snippet: {
      title: string;
      thumbnails: {
        high: { url: string };
        medium: { url: string };
        default: { url: string };
      };
      publishedAt: string;
      resourceId: {
        videoId: string;
      };
    };
    id: string;
  }>;
  nextPageToken?: string;
}

// Initialize dark mode from localStorage synchronously before render
const initializeDarkMode = () => {
  if (typeof window === 'undefined') return false;
  
  const savedDarkMode = localStorage.getItem("dark-mode") === "true";
  if (savedDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  return savedDarkMode;
};

const Highlights = () => {
  // Initialize dark mode state immediately
  const [darkMode, setDarkMode] = useState<boolean>(() => initializeDarkMode());
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Handle dark mode toggle immediately
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("dark-mode", String(newDarkMode));
    
    // Apply class immediately
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch ALL videos from YouTube playlist
  const fetchAllVideos = async (playlistId: string): Promise<VideoItem[]> => {
    let allVideos: VideoItem[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = 10; // Safety limit to prevent infinite requests

    try {
      do {
        pageCount++;
        
        // Build URL with pagination
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
        if (nextPageToken) {
          url += `&pageToken=${nextPageToken}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('YouTube API Error:', errorData);
          
          // If we hit quota limit, return what we have
          if (errorData.error?.code === 403 || errorData.error?.message?.includes('quota')) {
            console.warn('YouTube API quota exceeded, returning partial data');
            break;
          }
          
          throw new Error(`Failed to fetch videos: ${errorData.error?.message || response.statusText}`);
        }
        
        const data: PlaylistVideosResponse = await response.json();
        
        // Map the videos
        const pageVideos: VideoItem[] = data.items
          .filter(item => item.snippet?.resourceId?.videoId) // Filter out invalid items
          .map(item => ({
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || 
                      item.snippet.thumbnails.medium?.url || 
                      item.snippet.thumbnails.default?.url,
            publishedAt: item.snippet.publishedAt,
            videoId: item.snippet.resourceId.videoId
          }));

        allVideos = [...allVideos, ...pageVideos];
        nextPageToken = data.nextPageToken;

        // Stop if we've fetched enough pages
        if (pageCount >= maxPages) {
          console.log(`Stopped after ${maxPages} pages for safety`);
          break;
        }

        // Small delay to avoid rate limiting
        if (nextPageToken) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } while (nextPageToken);

      // Sort videos by date
      allVideos.sort((a, b) => {
        return sortBy === "newest" 
          ? new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          : new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      });

      return allVideos;

    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  };

  // Use React Query for caching
  const { data: videos, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['highlights', selectedLeague.id, sortBy],
    queryFn: () => fetchAllVideos(selectedLeague.playlistId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2, // Retry twice on failure
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const toggleSort = () => {
    setSortBy(prev => prev === "newest" ? "oldest" : "newest");
  };

  const getVideoCountText = () => {
    if (!videos) return "";
    if (videos.length >= 500) return "500+ videos";
    return `${videos.length} videos`;
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Highlights
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                All videos from official playlists
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isFetching}
                className="rounded-full"
              >
                <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-4 py-4 max-w-4xl mx-auto">
        {/* League Selector */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Select League
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {LEAGUES.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 flex-shrink-0 ${
                  selectedLeague.id === league.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border/50 text-foreground hover:bg-accent'
                }`}
              >
                <img
                  src={league.logo}
                  alt={league.name}
                  className="w-6 h-6 rounded-full object-contain"
                />
                <span className="font-medium text-sm">{league.name}</span>
                {selectedLeague.id === league.id && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* League Info and Controls */}
        <div className="bg-gradient-to-r from-card to-card/50 rounded-2xl border border-border/50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedLeague.logo}
                alt={selectedLeague.name}
                className="w-12 h-12 rounded-xl object-contain bg-white p-1 dark:bg-card"
              />
              <div>
                <h3 className="font-bold text-lg">{selectedLeague.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {videos ? getVideoCountText() : "Loading videos..."}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleSort}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter className="w-3 h-3" />
                {sortBy === "newest" ? "Newest First" : "Oldest First"}
              </Button>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading Skeletons - Grid Layout
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  <Skeleton className="w-full aspect-video rounded-none" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <div className="text-destructive mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Failed to load highlights</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Please check your connection"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.youtube.com/playlist?list=${selectedLeague.playlistId}`, '_blank')}
                  variant="default"
                >
                  Open YouTube
                </Button>
              </div>
            </div>
          ) : videos && videos.length > 0 ? (
            // Videos Grid
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
                  >
                    {/* Thumbnail with Play Button */}
                    <div className="relative overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => openYouTubeVideo(video.videoId)}
                          className="bg-primary/90 hover:bg-primary text-white p-3 rounded-full transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        >
                          <Play className="w-5 h-5" fill="white" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full w-fit">
                          <Calendar className="w-2 h-2" />
                          <span>{formatDate(video.publishedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Video Title */}
                    <div className="p-3">
                      <h3 
                        className="font-medium text-sm line-clamp-2 mb-2"
                        title={video.title}
                      >
                        {video.title}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(video.publishedAt)}
                        </span>
                        <Button
                          onClick={() => openYouTubeVideo(video.videoId)}
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button (if needed in future) */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing all {videos.length} videos
                </p>
              </div>
            </div>
          ) : (
            // No Videos State
            <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
              <div className="text-muted-foreground mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">No highlights found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Couldn't fetch videos for {selectedLeague.name}
              </p>
              <Button 
                onClick={() => window.open(`https://www.youtube.com/playlist?list=${selectedLeague.playlistId}`, '_blank')}
                variant="outline"
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                View on YouTube
              </Button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            All videos loaded from official YouTube playlists
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click any video to watch on YouTube
          </p>
        </div>
      </main>
    </PullToRefresh>
  );
};

export default Highlights;