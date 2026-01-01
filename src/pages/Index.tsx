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
      team1: { name: "Crystal Palace", logo: "https://imgs.ysscores.com/teams/128/6121690118883.png" },
      team2: { name: "Fulham", logo: "https://imgs.ysscores.com/teams/128/4711690118927.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-10T18:30:00',
      streamUrlEnglish: "https://proud-sound-d42d.cloud1-e3f.workers.dev/Bein2.m3u8",
      streamUrlArabic: "https://d22tkx0s4uwz6q.cloudfront.net/svg/index1/javascript.json",
      streamUrlServer3: "https://long-dawn-38ea.cloud1-e3f.workers.dev/9003.m3u8",
      streamUrlServer4: ""
    },

     {
      team1: { name: "Liverpool", logo: "https://imgs.ysscores.com/teams/128/4081724601375.png" },
      team2: { name: "Leeds United", logo: "https://imgs.ysscores.com/teams/128/4691690458244.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-01-00T18:30:00',
      streamUrlEnglish: "https://proud-sound-d42d.cloud1-e3f.workers.dev/Bein1.m3u8",
      streamUrlArabic: "https://d22tkx0s4uwz6q.cloudfront.net/svg/index2/javascript.json",
      streamUrlServer3: "https://long-dawn-38ea.cloud1-e3f.workers.dev/9000.m3u8",
      streamUrlServer4: "https://akotv.cc/eighty_eight.php?stream=bS1-6"
    },


     {
      team1: { name: "Nottingham", logo: "https://imgs.ysscores.com/teams/128/7741690119007.png" },
      team2: { name: "Everton", logo: "https://imgs.ysscores.com/teams/128/8461690118694.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2025-12-30T20:30:00',
      streamUrlEnglish: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax1.m3u8",
      streamUrlArabic: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax2.m3u8",
      streamUrlServer3: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax3.m3u8",
      streamUrlServer4: ""
    },

     {
      team1: { name: "West Ham", logo: "https://imgs.ysscores.com/teams/128/7191690118603.png" },
      team2: { name: "Brighton", logo: "https://imgs.ysscores.com/teams/128/2271696710594.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2025-12-30T20:30:00',
      streamUrlEnglish: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax1.m3u8",
      streamUrlArabic: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax2.m3u8",
      streamUrlServer3: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax3.m3u8",
      streamUrlServer4: ""
    },

    {
      team1: { name: "Arsenal", logo: "https://imgs.ysscores.com/teams/128/1701690118820.png" },
      team2: { name: "Aston Villa", logo: "https://imgs.ysscores.com/teams/128/9921723414870.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2025-12-30T21:15:00',
      streamUrlEnglish: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax1.m3u8",
      streamUrlArabic: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax2.m3u8",
      streamUrlServer3: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax3.m3u8",
      streamUrlServer4: ""
    },

     {
      team1: { name: "Man United", logo: "https://imgs.ysscores.com/teams/128/4871690119302.png" },
      team2: { name: "Wolves", logo: "https://imgs.ysscores.com/teams/128/9631690118479.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2025-12-30T21:15:00',
      streamUrlEnglish: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax1.m3u8",
      streamUrlArabic: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax2.m3u8",
      streamUrlServer3: "https://pub-f48f4d14f4d74af8baf6af9e01fbc000.r2.dev/BMax3.m3u8",
      streamUrlServer4: ""
    },
  ];
}

export default Index;
