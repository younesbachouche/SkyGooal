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
      team1: { name: "SL Benfica", logo: "https://imgs.ysscores.com/teams/128/4491690386690.png" },
      team2: { name: "Real Madrid", logo: "https://imgs.ysscores.com/teams/128/1871690196746.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "",
      streamUrlArabic: "https://mocef38798-be.hf.space/b/p/CANAL-LIVE-4/index.m3u8",
      streamUrlServer3: "https://mocef38798-be.hf.space/b/p/Liga-De-Campeones-1-BU/index.m3u8",
      streamUrlServer4: ""
    }, 
    {
      team1: { name: "SSC Napoli", logo: "https://imgs.ysscores.com/teams/128/9521720636634.png" },
      team2: { name: "Chelsea", logo: "https://imgs.ysscores.com/teams/128/2571690118280.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sawanac414-be.hf.space/b/p/TNT-Sports-4/index.m3u8",
      streamUrlArabic: "https://mocef38798-be.hf.space/b/p/CANAL-LIVE-5/index.m3u8",
      streamUrlServer3: "https://sireli1307-be.hf.space/b/p/Liga-De-Campeones-10-BU/index.m3u8",
      streamUrlServer4: ""
    }, 

    {
      team1: { name: "Dortmund", logo: "https://imgs.ysscores.com/teams/128/4201690288818.png" },
      team2: { name: "Inter", logo: "https://imgs.ysscores.com/teams/128/3101690283003.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://mocef38798-be.hf.space/b/p/CBS-Sports-Network/index.m3u8",
      streamUrlArabic: "https://sawanac414-be.hf.space/b/p/CANAL-LIVE-6/index.m3u8",
      streamUrlServer3: "https://sawanac414-be.hf.space/b/p/Liga-De-Campeones-9-BU/index.m3u8",
      streamUrlServer4: "https://mocef38798-be.hf.space/b/p/CBS-Sports-Network-BU/index.m3u8"
    },

    {
      team1: { name: "PSG", logo: "https://imgs.ysscores.com/teams/128/4461690287785.png" },
      team2: { name: "Newcastle", logo: "https://imgs.ysscores.com/teams/128/3721690119405.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sireli1307-be.hf.space/b/p/TNT-Sports-3/index.m3u8",
      streamUrlArabic: "https://sawanac414-be.hf.space/b/p/CANAL-LIVE-1/index.m3u8",
      streamUrlServer3: "https://mocef38798-be.hf.space/b/p/Liga-De-Campeones-6-BU/index.m3u8",
      streamUrlServer4: "https://sireli1307-be.hf.space/b/p/TNT-Sport-3-SD/index.m3u8"
    },

     {
      team1: { name: "Barcelona", logo: "https://imgs.ysscores.com/teams/128/9541690196746.png" },
      team2: { name: "Copenhagen", logo: "https://imgs.ysscores.com/teams/128/1701690822703.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sireli1307-be.hf.space/b/p/CANAL-LIVE-7/index.m3u8",
      streamUrlArabic: "https://sireli1307-be.hf.space/b/p/Liga-De-Campeones-2-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },
    {
      team1: { name: "PSV", logo: "https://imgs.ysscores.com/teams/128/3391690378187.png" },
      team2: { name: "Bayern Munich", logo: "https://imgs.ysscores.com/teams/128/2351690288818.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://mocef38798-be.hf.space/b/p/CANAL-LIVE-11/index.m3u8",
      streamUrlArabic: "https://mocef38798-be.hf.space/b/p/Liga-De-Campeones-14-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },

     {
      team1: { name: "Man City", logo: "https://imgs.ysscores.com/teams/128/4481690118308.png" },
      team2: { name: "Galatasaray", logo: "https://imgs.ysscores.com/teams/128/2081756067376.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sireli1307-be.hf.space/b/p/TNT-Sports-6-BU/index.m3u8",
      streamUrlArabic: "https://sireli1307-be.hf.space/b/p/CANAL-LIVE-9/index.m3u8",
      streamUrlServer3: "https://mocef38798-be.hf.space/b/p/Liga-De-Campeones-8-BU/index.m3u8",
      streamUrlServer4: ""
    },

    {
      team1: { name: "Leverkusen", logo: "https://imgs.ysscores.com/teams/128/7151690288816.png" },
      team2: { name: "Villarreal", logo: "https://imgs.ysscores.com/teams/128/7121690196747.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://mocef38798-be.hf.space/b/p/CANAL-LIVE-15/index.m3u8",
      streamUrlArabic: "https://sawanac414-be.hf.space/b/p/Liga-De-Campeones-5-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },

    {
      team1: { name: "Arsenal", logo: "https://imgs.ysscores.com/teams/128/1701690118820.png" },
      team2: { name: "Kairat", logo: "https://imgs.ysscores.com/teams/128/5591718101124.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sireli1307-be.hf.space/b/p/TNT-Sports-7-BU/index.m3u8",
      streamUrlArabic: "https://sireli1307-be.hf.space/b/p/CANAL-LIVE-12/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },

    {
      team1: { name: "Liverpool", logo: "https://imgs.ysscores.com/teams/128/4081724601375.png" },
      team2: { name: "Qarabag FK", logo: "https://imgs.ysscores.com/teams/128/5151690822077.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sawanac414-be.hf.space/b/p/TNT-Sports-2/index.m3u8",
      streamUrlArabic: "https://sireli1307-be.hf.space/b/p/CANAL-LIVE-8/index.m3u8",
      streamUrlServer3: "https://sawanac414-be.hf.space/b/p/Liga-De-Campeones-16-BU/index.m3u8",
      streamUrlServer4: ""
    },

     {
      team1: { name: "Monaco", logo: "https://imgs.ysscores.com/teams/128/3861690287583.png" },
      team2: { name: "Juventus", logo: "https://imgs.ysscores.com/teams/128/9331690283003.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sireli1307-be.hf.space/b/p/CANAL-LIVE-3/index.m3u8",
      streamUrlArabic: "https://sireli1307-be.hf.space/b/p/Liga-De-Campeones-11-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },
     {
      team1: { name: "Frankfurt", logo: "https://imgs.ysscores.com/teams/128/231690288818.png" },
      team2: { name: "Tottenham", logo: "https://imgs.ysscores.com/teams/128/2501692467226.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sawanac414-be.hf.space/b/p/CANAL-LIVE-13/index.m3u8",
      streamUrlArabic: "https://sireli1307-be.hf.space/b/p/BEIN-SPORTS-3/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },

    {
      team1: { name: "Atlético", logo: "https://imgs.ysscores.com/teams/128/1431719588699.png" },
      team2: { name: "Bodø/Glimt", logo: "https://imgs.ysscores.com/teams/128/8781690370522.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://mocef38798-be.hf.space/b/p/CANAL-LIVE-10/index.m3u8",
      streamUrlArabic: "https://sawanac414-be.hf.space/b/p/Liga-De-Campeones-3-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },
     {
      team1: { name: "Club Brugge", logo: "https://imgs.ysscores.com/teams/128/121690370520.png" },
      team2: { name: "Marseille", logo: "https://imgs.ysscores.com/teams/128/6031690287269.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sireli1307-be.hf.space/b/p/CANAL-LIVE-2/index.m3u8",
      streamUrlArabic: "https://sireli1307-be.hf.space/b/p/Liga-De-Campeones-15-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },

     {
      team1: { name: "Ajax", logo: "https://imgs.ysscores.com/teams/128/1361751718344.png" },
      team2: { name: "Olympiacos", logo: "https://imgs.ysscores.com/teams/128/1401690370533.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sireli1307-be.hf.space/b/p/CANAL-LIVE-16/index.m3u8",
      streamUrlArabic: "https://mocef38798-be.hf.space/b/p/Liga-De-Campeones-12-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },

    {
      team1: { name: "St.Gilloise", logo: "https://imgs.ysscores.com/teams/128/3651690370510.png" },
      team2: { name: "Atalanta", logo: "https://imgs.ysscores.com/teams/128/3541690283001.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/42.png",
      competitionName: "Champions League",
      matchTime: '2026-01-28T21:00:00',
      streamUrlEnglish: "https://sawanac414-be.hf.space/b/p/CANAL-LIVE-17/index.m3u8",
      streamUrlArabic: "https://sawanac414-be.hf.space/b/p/Liga-De-Campeones-13-BU/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },
  

     
    
  ];
  
}

export default Index;
