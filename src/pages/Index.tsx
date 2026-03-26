import React, { useState, useEffect, useMemo, useCallback } from "react";
import MatchCard from "@/components/MatchCard";
import { Button } from "@/components/ui/button";
import StreamPopup from "@/components/StreamPopup";
import CompetitionFilter from "@/components/CompetitionFilter";
import LiveTicker from "@/components/LiveTicker";
import PullToRefresh from "@/components/PullToRefresh";
import { Moon, Sun, RefreshCw, Send } from "lucide-react";

interface Team {
  name: string;
  logo: string;
}

interface Match {
  team1: Team;
  team2: Team;
  competitionLogo: string;
  competitionDarkLogo: string;
  competitionName: string;
  matchTime: string;
  streamUrlEnglish: string;
  streamUrlArabic: string;
  streamUrlServer3: string;
  streamUrlServer4?: string;
}

const TELEGRAM_CHANNEL_URL = "https://t.me/skylivebyyounes";

const Index = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStreamUrls, setCurrentStreamUrls] = useState<{ 
    english: string; 
    arabic: string; 
    server3: string;
    server4?: string;
  } | null>(null);
  
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("dark-mode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
    
    setAllMatches(getMatchData());
  }, []);

  // Get unique competitions from matches
  const competitions = useMemo(() => {
    const uniqueComps = new Map<string, { name: string; logo: string }>();
    allMatches.forEach(match => {
      if (!uniqueComps.has(match.competitionName)) {
        uniqueComps.set(match.competitionName, {
          name: match.competitionName,
          logo: match.competitionLogo
        });
      }
    });
    return Array.from(uniqueComps.values());
  }, [allMatches]);

  const { ongoingOrUpcoming, ended, liveMatches } = useMemo(() => {
    let filteredMatches = allMatches;
    
    if (selectedCompetition) {
      filteredMatches = allMatches.filter(m => m.competitionName === selectedCompetition);
    }
    
    const sorted = sortMatches(filteredMatches);
    
    const now = new Date().getTime();
    const live = sorted.ongoingOrUpcoming.filter(match => {
      const matchStartTime = new Date(match.matchTime).getTime();
      return now >= matchStartTime - 5 * 60 * 1000; // Started or starting in 5 min
    });
    
    return { ...sorted, liveMatches: live };
  }, [allMatches, selectedCompetition]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("dark-mode", String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const refreshMatches = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setAllMatches(getMatchData());
    setIsRefreshing(false);
  }, []);

  const openStreamPopup = (englishUrl: string, arabicUrl: string, server3Url: string, server4Url?: string) => {
    setCurrentStreamUrls({
      english: englishUrl,
      arabic: arabicUrl,
      server3: server3Url,
      server4: server4Url
    });
    setIsPopupVisible(true);
  };
  
  const closeStreamPopup = () => {
    setIsPopupVisible(false);
    setCurrentStreamUrls(null);
  };

  const openTelegramChannel = () => {
    window.open(TELEGRAM_CHANNEL_URL, "_blank");
  };
  
  return (
    <>
      <PullToRefresh onRefresh={refreshMatches} className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Sky Live
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                by Younes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={openTelegramChannel}
                className="rounded-full text-[#0088cc] hover:text-[#0088cc] hover:bg-[#0088cc]/10"
                title="Join Telegram Channel"
              >
                <Send className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshMatches}
                disabled={isRefreshing}
                className="rounded-full"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
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
      
      {/* Live Ticker */}
      <LiveTicker matches={liveMatches} />
      
      <main className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-3">
        {/* Competition Filter */}
        {competitions.length > 1 && (
          <CompetitionFilter
            competitions={competitions}
            selectedCompetition={selectedCompetition}
            onSelectCompetition={setSelectedCompetition}
          />
        )}

        {/* Live/Upcoming Matches */}
        {ongoingOrUpcoming.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <h2 className="text-base sm:text-lg font-semibold">Live & Upcoming</h2>
              <span className="text-xs text-muted-foreground">({ongoingOrUpcoming.length})</span>
            </div>
            {ongoingOrUpcoming.map((match, index) => (
              <MatchCard 
                key={index} 
                match={match} 
                index={index} 
                onOpenStream={openStreamPopup}
              />
            ))}
          </div>
        )}
        
        {/* Ended Matches */}
        {ended.length > 0 && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-base sm:text-lg font-semibold text-muted-foreground">Ended Matches</h2>
              <span className="text-xs text-muted-foreground">({ended.length})</span>
            </div>
            {ended.map((match, index) => (
              <MatchCard 
                key={index} 
                match={match} 
                index={ongoingOrUpcoming.length + index} 
                onOpenStream={openStreamPopup}
                isEnded={true}
              />
            ))}
          </div>
        )}

        {ongoingOrUpcoming.length === 0 && ended.length === 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
            <p className="text-muted-foreground">
              {selectedCompetition 
                ? `No matches found for ${selectedCompetition}` 
                : 'No matches scheduled'}
            </p>
          </div>
        )}
      </main>

      </PullToRefresh>

      {isPopupVisible && currentStreamUrls && (
        <StreamPopup 
          streams={currentStreamUrls}
          onClose={closeStreamPopup}
        />
      )}
    </>
  );
};

function sortMatches(matches: Match[]) {
  const now = new Date().getTime();
  const ongoingOrUpcoming: Match[] = [];
  const ended: Match[] = [];

  matches.forEach(match => {
    // Parse match time - treat as UTC if it has 'Z', otherwise as local time
    const matchStartTime = new Date(match.matchTime).getTime();
    const matchEndTime = matchStartTime + 2 * 60 * 60 * 1000; // 2 hours after match start

    if (now >= matchEndTime) {
      ended.push(match);
    } else {
      ongoingOrUpcoming.push(match);
    }
  });

  
  ongoingOrUpcoming.sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime());
  ended.sort((a, b) => new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime());

  return { ongoingOrUpcoming, ended };
}

function getMatchData() {
  return [


{
      team1: { name: "Türkiye", logo: "https://imgs.ysscores.com/teams/128/171763117169.png" },
      team2: { name: "Romania", logo: "https://imgs.ysscores.com/teams/128/6501763085627.png" },
      competitionLogo: "https://imagecache.365scores.com/image/upload/f_png,w_64,h_64,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v1/Competitions/light/5421",
      competitionDarkLogo: "https://imagecache.365scores.com/image/upload/f_png,w_64,h_64,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v1/Competitions/light/5421.png",
      competitionName: "WC - Qualification UEFA",
      matchTime: '2026-03-26T18:00:00',
      streamUrlEnglish: "https://live.thmanyah.blog/live/ClapprPlayer2?ch=https://m3u8proxy-b66.pages.dev/Proxy?url=https://tv.beinconnect.us/hls/51.m3u8",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },

    
     
    
    {
      team1: { name: "Ukraine", logo: "https://imgs.ysscores.com/teams/128/6961763117440.png" },
      team2: { name: "Sweden", logo: "https://imgs.ysscores.com/teams/128/2981763087554.png" },
      competitionLogo: "https://imagecache.365scores.com/image/upload/f_png,w_64,h_64,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v1/Competitions/light/5421",
      competitionDarkLogo: "https://imagecache.365scores.com/image/upload/f_png,w_64,h_64,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v1/Competitions/light/5421.png",
      competitionName: "WC - Qualification UEFA",
      matchTime: '2026-03-26T20:45:00',
      streamUrlEnglish: "https://d1pds5gq7p4s0a.cloudfront.net/status/2/fronts.woff2?b2e739",
      streamUrlArabic: "https://d366vag81fyxha.cloudfront.net/svg/n3/javascript.json",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8"
    },

    {
      team1: { name: "Poland", logo: "https://imgs.ysscores.com/teams/128/7861763085396.png" },
      team2: { name: "Albania", logo: "https://imgs.ysscores.com/teams/128/1681763066722.png" },
      competitionLogo: "https://imagecache.365scores.com/image/upload/f_png,w_64,h_64,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v1/Competitions/light/5421",
      competitionDarkLogo: "https://imagecache.365scores.com/image/upload/f_png,w_64,h_64,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v1/Competitions/light/5421.png",
      competitionName: "WC - Qualification UEFA",
      matchTime: '2026-03-26T20:45:00',
      streamUrlEnglish: "https://d1pds5gq7p4s0a.cloudfront.net/status/2/fronts.woff2?b2e739",
      streamUrlArabic: "https://d366vag81fyxha.cloudfront.net/svg/n3/javascript.json",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8"
    },



      {
      team1: { name: "Brazil", logo: "https://imgs.ysscores.com/teams/128/4331763069849.png" },
      team2: { name: "France", logo: "https://imgs.ysscores.com/teams/128/2961763078000.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "Friendlies",
      matchTime: '2026-03-26T21:00:00',
      streamUrlEnglish: "https://d1pds5gq7p4s0a.cloudfront.net/status/2/fronts.woff2?b2e739",
      streamUrlArabic: "https://d366vag81fyxha.cloudfront.net/svg/n3/javascript.json",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8"
    },
    
   

  ];
  
}

export default Index;
