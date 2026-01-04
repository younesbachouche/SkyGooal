import React, { useState, useEffect, useMemo, useCallback } from "react";
import MatchCard from "@/components/MatchCard";
import { Button } from "@/components/ui/button";
import StreamPopup from "@/components/StreamPopup";
import CompetitionFilter from "@/components/CompetitionFilter";
import LiveTicker from "@/components/LiveTicker";
import PullToRefresh from "@/components/PullToRefresh";
import { Moon, Sun, RefreshCw } from "lucide-react";

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

  // Filter and sort matches
  const { ongoingOrUpcoming, ended, liveMatches } = useMemo(() => {
    let filteredMatches = allMatches;
    
    if (selectedCompetition) {
      filteredMatches = allMatches.filter(m => m.competitionName === selectedCompetition);
    }
    
    const sorted = sortMatches(filteredMatches);
    
    // Get live matches (started within 2 hours, not ended)
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
      team1: { name: "Lazio", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8543_small.png" },
      team2: { name: "Napoli", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9875_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A",
      matchTime: '2026-01-04T12:30:00',
      streamUrlEnglish: "https://sportina.cc/AD-1/video.m3u8",
      streamUrlArabic: "https://pub-341f976b6ff14b25926c5a182dd72b58.r2.dev/70094113.m3u8",
      streamUrlServer3: "",
      streamUrlServer4:"https://karwan.tv/live/sport-channel-8-1.php"
    },
     {
      team1: { name: "Leeds United", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8463_small.png" },
      team2: { name: "Man United", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10260_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-04T13:30:00',
      streamUrlEnglish: "https://storage.googleapis.com/zzeuugen/mux_video_ts/index-1.m3u8",
      streamUrlArabic: "https://live1-d2.cloud1-e3f.workers.dev/H-Bein1.m3u8",
      streamUrlServer3: "https://live2-d1.cloud1-e3f.workers.dev/D-Bein1.m3u8"
      
    },
    {
      team1: { name: "Sevilla", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8302_small.png" },
      team2: { name: "Levante", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8581_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionName: "La Liga",
      matchTime: '2026-01-04T14:00:00',
      streamUrlEnglish: "https://d35264c0omvo5t.cloudfront.net/svg/n5/javascript.json",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: ""
    }, 

     {
      team1: { name: "Fulham", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9879_small.png" },
      team2: { name: "Liverpool", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8650_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-04T16:00:00',
      streamUrlEnglish: "https://d2xprh676mlnjw.cloudfront.net/status/e1/fronts.woff2",
      streamUrlArabic: "https://storage.googleapis.com/pouovertrong1/mux_video_ts1/index-1.m3u8",
      streamUrlServer3: ""
      
    },
    {
      team1: { name: "Newcastle", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10261_small.png" },
      team2: { name: "Crystal Palace", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9826_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-04T16:00:00',
      streamUrlEnglish: "",
      streamUrlArabic: "https://d2xprh676mlnjw.cloudfront.net/status/e3/fronts.woff2",
      streamUrlServer3: "https://storage.googleapis.com/pouovertrong3/mux_video_ts/index-1.m3u8"
      
    },

    {
      team1: { name: "Everton", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8668_small.png" },
      team2: { name: "Brentford", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9937_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-04T16:00:00',
      streamUrlEnglish: "https://d2xprh676mlnjw.cloudfront.net/status/e2/fronts.woff2",
      streamUrlArabic: "",
      streamUrlServer3: ""
      
    },

    {
      team1: { name: "Tottenham", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8586_small.png" },
      team2: { name: "Sunderland", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8472_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-04T16:00:00',
      streamUrlEnglish: "https://d2xprh676mlnjw.cloudfront.net/status/e4/fronts.woff2",
      streamUrlArabic: "",
      streamUrlServer3: ""
      
    },
 {
      team1: { name: "Real Madrid", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8633_small.png" },
      team2: { name: "Real Betis", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8603_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionName: "La Liga",
      matchTime: '2026-01-04T16:15:00',
      streamUrlEnglish: "https://akamaized.live/2fhd/index.m3u8",
      streamUrlArabic: "https://d2xprh676mlnjw.cloudfront.net/status/l1/fronts.woff2",
      streamUrlServer3: "https://storage.googleapis.com/pouovertrong4/mux_video_ts/index-1.m3u8",
      streamUrlServer4: "https://karwan.tv/live/sport-channel-1-1.php"
    }, 
    {
      team1: { name: "Morocco", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/6262_small.png" },
      team2: { name: "Tanzania", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/7941_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/289.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/3321747861244.png",
      competitionName: "AFCON 2025",
      matchTime: '2026-01-04T17:00:00',
      streamUrlEnglish: "https://live1-d2.cloud1-e3f.workers.dev/H-BeinMax1.m3u8",
      streamUrlArabic: "https://live1-d2.cloud1-e3f.workers.dev/L-ArryadiaTNT.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },
       
   
    {
      team1: { name: "Man City", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8456_small.png" },
      team2: { name: "Chelsea", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8455_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-04T18:30:00',
      streamUrlEnglish: "https://pub-341f976b6ff14b25926c5a182dd72b58.r2.dev/70094116.m3u8",
      streamUrlArabic: "",
      streamUrlServer3: "",
      
    },
   
    {
      team1: { name: "South Africa", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/6316_small.png" },
      team2: { name: "Cameroon", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/6629_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/289.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/3321747861244.png",
      competitionName: "AFCON 2025",
      matchTime: '2026-01-04T20:00:00',
      streamUrlEnglish: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax1.m3u8",
      streamUrlArabic: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax2.m3u8",
      streamUrlServer3: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax3.m3u8",
      streamUrlServer4: ""
    },

     {
      team1: { name: "Inter", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8636_small.png" },
      team2: { name: "Bologna", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9857_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A",
      matchTime: '2026-01-04T20:45:00',
      streamUrlEnglish: "https://sportina.cc/AD-1/video.m3u8",
      streamUrlArabic: "https://pub-341f976b6ff14b25926c5a182dd72b58.r2.dev/70094113.m3u8",
      streamUrlServer3: "",
      streamUrlServer4:"https://karwan.tv/live/sport-channel-8-1.php"
    },

    {
      team1: { name: "Real Sociedad", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8560_small.png" },
      team2: { name: "Atletico Madrid", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9906_small.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionName: "La Liga",
      matchTime: '2026-01-04T21:00:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: ""
    }, 
  ];
}

export default Index;
