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
      team1: { name: "Russia", logo: "https://upload.wikimedia.org/wikipedia/ar/archive/e/ec/20231126084417!Russia_football_association.png" },
      team2: { name: "Nicaragua", logo: "https://upload.wikimedia.org/wikipedia/fr/c/c8/Logo_F%C3%A9d%C3%A9ration_Nicaragua_Football.svg" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T17:30:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },

    
     

      {
      team1: { name: "Austria", logo: "https://images.elbotola.com/stats/logos/gpxwrxlh6d1ryk0.png" },
      team2: { name: "Ghana", logo: "https://images.elbotola.com/stats/logos/j1l4rjnhoz6m7vx.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T18:00:00',
      streamUrlEnglish: "https://husa.wizgan2013.workers.dev/?id=1424",
      streamUrlArabic: "https://m3u8proxy-b66.pages.dev/Proxy?url=https://tv.beinconnect.us/hls/50.m3u8",

      streamUrlServer3: "https://live20.bozztv.com/akamaissh101/ssh101/osnmixflix/playlist.m3u8",
      streamUrlServer4: "http://sportook.online/BEIN-S1/video.m3u8",
      streamUrlPc: ""
    },


     
    

    {
      team1: { name: "Saudi Arabia", logo: "https://images.elbotola.com/stats/logos/j1l4rjnh05ym7vx.png" },
      team2: { name: "Egypt", logo: "https://images.elbotola.com/stats/logos/4zp5rzgh84yq82w.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T18:30:00',
      streamUrlEnglish: "https://yskylive.netlify.app/city2",
      streamUrlArabic: "https://m3u8proxy-b66.pages.dev/Proxy?url=https://tv.beinconnect.us/hls/14.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },


     {
      team1: { name: "Jordan", logo: "https://images.elbotola.com/stats/logos/j1l4rjnho9jm7vx.png" },
      team2: { name: "Costa Rica", logo: "https://images.elbotola.com/stats/logos/kdj2ryoholnq1zp.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T18:30:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "http://93.184.10.248/JordanSport/index.m3u8",
      streamUrlPc: ""
    },
       

     
    {
      team1: { name: "Algeria", logo: "https://upload.wikimedia.org/wikipedia/fr/8/8b/Nouveau_logo_%C3%89quipe_d%27Alg%C3%A9rie.png" },
      team2: { name: "Guatemala", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Guatemala_National_Football_team_badge.png/250px-Guatemala_National_Football_team_badge.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T20:30:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },



     {
      team1: { name: "England", logo: "https://images.elbotola.com/stats/logos/z8yomo4hl08q0j6.png" },
      team2: { name: "Uruguay", logo: "https://images.elbotola.com/stats/logos/z318q66hln7qo9j.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T20:45:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },
   

     {
      team1: { name: "Switzerland", logo: "https://images.elbotola.com/stats/logos/e4wyrn4hn3gq86p.png" },
      team2: { name: "Germany", logo: "https://images.elbotola.com/stats/logos/d23xmvkh590qg8n.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T20:45:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },


     {
      team1: { name: "Netherlands", logo: "https://images.elbotola.com/stats/logos/9dn1m1ghzj5moep.png" },
      team2: { name: "Norway", logo: "https://images.elbotola.com/stats/logos/8y39mp1h77lmojx.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T20:45:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },


    {
      team1: { name: "Spain", logo: "https://images.elbotola.com/stats/logos/dn1m1gh4vgymoep.png" },
      team2: { name: "Serbia", logo: "https://images.elbotola.com/stats/logos/9k82rekhd7prepz.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T21:00:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },


    
    {
      team1: { name: "Morocco", logo: "https://images.elbotola.com/stats/logos/56ypq3nh9nzmd7o.png" },
      team2: { name: "Ecuador", logo: "https://images.elbotola.com/stats/logos/p3glrw7h2z5qdyj.png" },
      competitionLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionDarkLogo: "https://imgs.ysscores.com/championship/150/7671693419239.png",
      competitionName: "International Friendly",
      matchTime: '2026-03-27T21:15:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "",
      streamUrlPc: ""
    },

  ];
  
}

export default Index;
