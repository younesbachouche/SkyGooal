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
      team1: { name: "Como", logo: "https://imgs.ysscores.com/teams/128/8641690823614.png" },
      team2: { name: "Pisa", logo: "https://imgs.ysscores.com/teams/128/8651691681667.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A",
      matchTime: '2026-03-22T12:30:00',
      streamUrlEnglish: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "http://bouygues-cdn.r1v.us:8080/live/d49dc02ec79b/k5cfhnm1/239247.m3u8"
    },
    {
      team1: { name: "Newcastle", logo: "https://imgs.ysscores.com/teams/128/3721690119405.png" },
      team2: { name: "Sunderland", logo: "https://imgs.ysscores.com/teams/128/10001690823905.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-03-22T13:00:00',
      streamUrlEnglish: "https://d1r7gmumpv7lw0.cloudfront.net/status/1/fronts.woff2?2b7b09",
      streamUrlArabic: "https://d3izosn7ff2iru.cloudfront.net//svg/n1/javascript.json",
      streamUrlServer3: "https://bl.rutube.ru/livestream/9585fdae92af45f113fdcc9f6c4ba442/index.m3u8?s=KgZtccuHrnaljGaN7cmUwA&e=2068506973&scheme=https",
      streamUrlServer4: "https://eventcdn02-nowe.akamaized.net/hls/CH621/index.m3u8"
    },
   
    {
      team1: { name: "Barcelona", logo: "https://imgs.ysscores.com/teams/128/9541690196746.png" },
      team2: { name: "Vallecano", logo: "https://imgs.ysscores.com/teams/128/1511690196745.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png",
      competitionName: "La Liga",
      matchTime: '2026-03-22T14:00:00',
      streamUrlEnglish: "https://storage.googleapis.com/uncetrunvover4/mux_video_ts1/index-1.m3u8",
      streamUrlArabic: "https://daffodil.xn--1000-ugoa0hsb9a0hb.com/dep.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },


     {
      team1: { name: "Atalanta", logo: "https://imgs.ysscores.com/teams/128/3541690283001.png" },
      team2: { name: "Hellas Verona", logo: "https://imgs.ysscores.com/teams/128/3871690283003.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A",
      matchTime: '2026-03-22T15:00:00',
      streamUrlEnglish: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "http://sportkn.store/AD1/video.m3u8"
    },

    {
      team1: { name: "Bologna", logo: "https://imgs.ysscores.com/teams/128/4281690283003.png" },
      team2: { name: "Lazio", logo: "https://imgs.ysscores.com/teams/128/5111690283002.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A",
      matchTime: '2026-03-22T15:00:00',
      streamUrlEnglish: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "http://sportkn.store/AD1/video.m3u8"
    },
    


    {
      team1: { name: "Lyon", logo: "https://imgs.ysscores.com/teams/128/4081690287528.png" },
      team2: { name: "Monaco", logo: "https://imgs.ysscores.com/teams/128/3861690287583.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/53.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/53.png",
      competitionName: "Ligue 1",
      matchTime: '2026-03-22T15:00:00',
      streamUrlEnglish: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "http://sportkn.store/AD1/video.m3u8"
    },

     {
      team1: { name: "Aston Villa", logo: "https://imgs.ysscores.com/teams/128/9921723414870.png" },
      team2: { name: "West Ham", logo: "https://imgs.ysscores.com/teams/128/7191690118603.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-03-22T15:15:00',
      streamUrlEnglish: "https://d1pds5gq7p4s0a.cloudfront.net/status/3/fronts.woff2?b72880",
      streamUrlArabic: "https://storage.googleapis.com/uncetrunvover1/mux_video_ts1/index-1.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    }, 
    {
      team1: { name: "Tottenham", logo: "https://imgs.ysscores.com/teams/128/2501692467226.png" },
      team2: { name: "Nottingham", logo: "https://imgs.ysscores.com/teams/128/7741690119007.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League",
      matchTime: '2026-03-22T15:15:00',
      streamUrlEnglish: "https://d1pds5gq7p4s0a.cloudfront.net/status/3/fronts.woff2?b72880",
      streamUrlArabic: "https://storage.googleapis.com/uncetrunvover1/mux_video_ts1/index-1.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    }, 

    
    {
      team1: { name: "OM", logo: "https://imgs.ysscores.com/teams/128/6031690287269.png" },
      team2: { name: "Lille", logo: "https://imgs.ysscores.com/teams/128/381690287334.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/53.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/53.png",
      competitionName: "Ligue 1",
      matchTime: '2026-03-22T17:15:00',
      streamUrlEnglish: "https://liveua.score806.cc/paramount1/tracks-v1a1/mono.m3u8",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: "http://sportkn.store/AD1/video.m3u8"
    },
    

     {
      team1: { name: "Arsenal", logo: "https://imgs.ysscores.com/teams/128/1701690118820.png" },
      team2: { name: "Man City", logo: "https://imgs.ysscores.com/teams/128/4481690118308.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/133.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/133.png",
      competitionName: "EFL Cup",
      matchTime: '2026-03-22T17:30:00',
      streamUrlEnglish: "https://d1pds5gq7p4s0a.cloudfront.net/status/2/fronts.woff2?b2e739",
      streamUrlArabic: "https://d366vag81fyxha.cloudfront.net/svg/n3/javascript.json",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },
    
       
     
    {
      team1: { name: "Roma", logo: "https://imgs.ysscores.com/teams/128/17722024059541.png" },
      team2: { name: "Lecce", logo: "https://imgs.ysscores.com/teams/128/9031690283003.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A",
      matchTime: '2026-03-22T18:00:00',
      streamUrlEnglish: "https://live.alahly-eg.com/live/channels/dlhd?id=ElevenSports2PL",
      streamUrlArabic: "https://live.alahly-eg.com/live/channels/dlhd?id=SPT2",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },

 {
      team1: { name: "A.Bilbao", logo: "https://imgs.ysscores.com/teams/128/1061690197944.png" },
      team2: { name: "Real Betis", logo: "https://imgs.ysscores.com/teams/128/17645945054618.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png",
      competitionName: "La Liga",
      matchTime: '2026-03-22T18:30:00',
      streamUrlEnglish: "https://storage.googleapis.com/uncetrunvover4/mux_video_ts1/index-1.m3u8",
      streamUrlArabic: "https://daffodil.xn--1000-ugoa0hsb9a0hb.com/dep.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },


     

    {
      team1: { name: "Real Madrid", logo: "https://imgs.ysscores.com/teams/128/1871690196746.png" },
      team2: { name: "Atlético", logo: "https://imgs.ysscores.com/teams/128/1431719588699.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png",
      competitionName: "La Liga",
      matchTime: '2026-03-22T21:00:00',
      streamUrlEnglish: "",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },
   

  ];
  
}

export default Index;
