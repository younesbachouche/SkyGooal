import React, { useState, useEffect, useMemo, useCallback } from "react";
import MatchCard from "@/components/MatchCard";
import { Button } from "@/components/ui/button";
import StreamPopup from "@/components/StreamPopup";
import CompetitionFilter from "@/components/CompetitionFilter";
import LiveTicker from "@/components/LiveTicker";
import PullToRefresh from "@/components/PullToRefresh";
import { Moon, Sun, RefreshCw, X, Send } from "lucide-react";

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
  const [showTelegramPopup, setShowTelegramPopup] = useState<boolean>(false);
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
    
    // Show Telegram popup on first visit (check localStorage)
    const hasSeenTelegramPopup = localStorage.getItem("has-seen-telegram-popup");
    if (!hasSeenTelegramPopup) {
      setTimeout(() => {
        setShowTelegramPopup(true);
      }, 1000); // Show after 1 second
    }
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

  const closeTelegramPopup = () => {
    setShowTelegramPopup(false);
    localStorage.setItem("has-seen-telegram-popup", "true");
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

      {/* Telegram Popup */}
      {showTelegramPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button
              onClick={closeTelegramPopup}
              className="absolute top-4 right-4 z-10 rounded-full p-1.5 hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <div className="p-6 sm:p-8">
              {/* Telegram Logo */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Send className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-card border-4 border-background flex items-center justify-center">
                    <span className="text-2xl">📢</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold">
                  Join Our Community
                </h3>
                
                <p className="text-muted-foreground">
                  Get the latest updates, match schedules, and stream links directly on Telegram!
                </p>
                
                <div className="pt-2">
                  <ul className="text-sm text-left text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Instant match notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Backup stream links</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Live score updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Community support</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Join Button */}
              <div className="mt-8">
                <button
                  onClick={openTelegramChannel}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send className="h-5 w-5" />
                  <span>Join Our Telegram Channel</span>
                </button>
                
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Over 1k+ members already joined!
                </p>
              </div>
              
              {/* Footer Note */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-center text-muted-foreground">
                  Join to stay updated with all live matches and never miss a game!
                </p>
              </div>
            </div>
          </div>
        </div>
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
      team1: { name: "Man United", logo: "https://imgs.ysscores.com/teams/128/4871690119302.png" },
      team2: { name: "Tottenham", logo: "https://imgs.ysscores.com/teams/128/2501692467226.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-02-07T13:30:00',
      streamUrlEnglish: "https://d1lgd3xdc194i4.cloudfront.net/status/1/fronts.woff2?39ece5",
      streamUrlArabic: "https://pub-41becd24fbe14338b1f8ff15149e2cf7.r2.dev/22_.m3u8",
      streamUrlServer3: "https://razkomoknine.blogspot.com/",
      streamUrlServer4: "https://mocef38798-be.hf.space/b/p/TNT-Sports-1-BU/index.m3u8"
    }, 
      {
      team1: { name: "Wolfsburg", logo: "https://imgs.ysscores.com/teams/128/6941690288817.png" },
      team2: { name: "Dortmund", logo: "https://imgs.ysscores.com/teams/128/4201690288818.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/54.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/54.png",
      competitionName: "Bundesliga",
      matchTime: '2026-02-07T15:30:00',
      streamUrlEnglish: "https://pub-41becd24fbe14338b1f8ff15149e2cf7.r2.dev/67_.m3u8",
      streamUrlArabic: "https://pub-41becd24fbe14338b1f8ff15149e2cf7.r2.dev/41_.m3u8",
      streamUrlServer3: "https://pub-41becd24fbe14338b1f8ff15149e2cf7.r2.dev/19_.m3u8",
      streamUrlServer4: ""
    }, 
    
    {
      team1: { name: "Arsenal", logo: "https://imgs.ysscores.com/teams/128/1701690118820.png" },
      team2: { name: "Sunderland", logo: "https://imgs.ysscores.com/teams/128/10001690823905.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-02-07T16:00:00',
      streamUrlEnglish: "https://storage.googleapis.com/pourtytnvvsde1/mux_video_ts/index-1.m3u8",
      streamUrlArabic: "https://d1lgd3xdc194i4.cloudfront.net/status/2/fronts.woff2?6f9c98",
      streamUrlServer3: "",
      streamUrlServer4: ""
    }, 

     {
      team1: { name: "Wolves", logo: "https://imgs.ysscores.com/teams/128/9631690118479.png" },
      team2: { name: "Chelsea", logo: "https://imgs.ysscores.com/teams/128/2571690118280.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-02-07T16:00:00',
      streamUrlEnglish: "https://storage.googleapis.com/pourtytnvvsde2/mux_video_ts/index-1.m3u8",
      streamUrlArabic: "https://d1lgd3xdc194i4.cloudfront.net/status/5/fronts.woff2?6cc70f",
      streamUrlServer3: "https://pub-41becd24fbe14338b1f8ff15149e2cf7.r2.dev/3_.m3u8",
      streamUrlServer4: ""
    }, 

     {
      team1: { name: "Fulham", logo: "https://imgs.ysscores.com/teams/128/4711690118927.png" },
      team2: { name: "Everton", logo: "https://imgs.ysscores.com/teams/128/8461690118694.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-02-07T16:00:00',
      streamUrlEnglish: "https://d2j7633p2yhdob.cloudfront.net/svg/n4/javascript.json",
      streamUrlArabic: "https://pub-41becd24fbe14338b1f8ff15149e2cf7.r2.dev/26_.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    }, 

     {
      team1: { name: "Burnley", logo: "https://imgs.ysscores.com/teams/128/7301690118156.png" },
      team2: { name: "West Ham", logo: "https://imgs.ysscores.com/teams/128/7191690118603.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-02-07T16:00:00',
      streamUrlEnglish: "https://d2j7633p2yhdob.cloudfront.net/svg/n5/javascript.json",
      streamUrlArabic: "https://d1lgd3xdc194i4.cloudfront.net/status/3/fronts.woff2?9a37bd",
      streamUrlServer3: "",
      streamUrlServer4: ""
    }, 


     {
      team1: { name: "Bournemouth", logo: "https://imgs.ysscores.com/teams/128/7651690118769.png" },
      team2: { name: "Aston Villa", logo: "https://imgs.ysscores.com/teams/128/9921723414870.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-02-07T16:00:00',
      streamUrlEnglish: "https://d2j7633p2yhdob.cloudfront.net/svg/n3/javascript.json",
      streamUrlArabic: "https://pub-41becd24fbe14338b1f8ff15149e2cf7.r2.dev/25_.m3u8",
      streamUrlServer3: "https://d1lgd3xdc194i4.cloudfront.net/status/1/fronts.woff2?23652e",
      streamUrlServer4: ""
    }, 
   

     {
      team1: { name: "Barcelona", logo: "https://imgs.ysscores.com/teams/128/9541690196746.png" },
      team2: { name: "Mallorca", logo: "https://imgs.ysscores.com/teams/128/5291690196746.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png",
      competitionName: "La Liga",
      matchTime: '2026-02-07T16:15:00',
      streamUrlEnglish: "https://d37w970r8uelg1.cloudfront.net/status/1/fronts.woff2?1f7df6",
      streamUrlArabic: "https://d2gvljzyfaudw2.cloudfront.net/svg/n1/javascript.json",
      streamUrlServer3: "https://sireli1307-be.hf.space/b/p/EPL-02/index.m3u8",
      streamUrlServer4: "https://mocef38798-be.hf.space/b/p/CANAL-LIVE-5/index.m3u8"
    },  

   


    
  ];
  
}

export default Index;
