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
      return now >= matchStartTime - 5 * 60 * 1000; 
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
    const matchStartTime = new Date(match.matchTime).getTime();
    const matchEndTime = matchStartTime + 2 * 60 * 60 * 1000; 

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
      team1: { name: "Arsenal", logo: "https://imgs.ysscores.com/teams/128/1701690118820.png" },
      team2: { name: "Bournemouth", logo: "https://imgs.ysscores.com/teams/128/7651690118769.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League - ENGLAND",
      matchTime: '2026-04-11T12:30:00',
      streamUrlEnglish: "https://yskylive.netlify.app/bein1",
      streamUrlArabic: "https://1syrialive.s3.us-east-2.amazonaws.com/bein1/master.m3u8",
      streamUrlServer3: "https://eventcdn02-nowe.akamaized.net/hls/CH621/index.m3u8",
      streamUrlServer4: "https://w.shahidtv.net/live/34682514/73347194/404.m3u8"
    },


     {
      team1: { name: "Dortmund", logo: "https://imgs.ysscores.com/teams/128/4201690288818.png" },
      team2: { name: "Leverkusen", logo: "https://imgs.ysscores.com/teams/128/7151690288816.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/54.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/54.png",
      competitionName: "Bundesliga - GERMANY",
      matchTime: '2026-04-11T14:30:00',
      streamUrlEnglish: "https://live.alahly-eg.com/live/channels/dlhd?id=ElevenSports1PL",
      streamUrlArabic: "https://1syrialive.s3.us-east-2.amazonaws.com/shahid1/shahid1_1080p/index.m3u8",
      streamUrlServer3: "https://smarthard.click/hls/8r59wy2BRApK/index.m3u8",
      streamUrlServer4: ""
    },



     {
      team1: { name: "Brentford", logo: "https://imgs.ysscores.com/teams/128/4791690118957.png" },
      team2: { name: "Everton", logo: "https://imgs.ysscores.com/teams/128/8461690118694.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League - ENGLAND",
      matchTime: '2026-04-11T15:00:00',
      streamUrlEnglish: "https://yskylive.netlify.app/bein1",
      streamUrlArabic: "https://d3unczxi7x1u.cloudfront.net/status/1/fronts.woff2?f7868c",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },



    {
      team1: { name: "Burnley", logo: "https://imgs.ysscores.com/teams/128/7301690118156.png" },
      team2: { name: "Brighton", logo: "https://imgs.ysscores.com/teams/128/2271696710594.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League - ENGLAND",
      matchTime: '2026-04-11T15:00:00',
      streamUrlEnglish: "https://d3unczxi7x1u.cloudfront.net/status/2/fronts.woff2?51e1fd",
      streamUrlArabic: "",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },



    
     {
      team1: { name: "Elche", logo: "https://imgs.ysscores.com/teams/128/6441698766179.png" },
      team2: { name: "Valencia", logo: "https://imgs.ysscores.com/teams/128/7881690196747.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png",
      competitionName: "La Liga - SPAIN",
      matchTime: '2026-04-11T15:15:00',
      streamUrlEnglish: "https://yskylive.netlify.app/bein5",
      streamUrlArabic: "https://smarthard.click/hls/sabrouchespndeportes/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },



     {
      team1: { name: "AC Milan", logo: "https://imgs.ysscores.com/teams/128/3181690283002.png" },
      team2: { name: "Udinese", logo: "https://imgs.ysscores.com/teams/128/8741690284718.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A - ITALY",
      matchTime: '2026-04-11T17:00:00',
      streamUrlEnglish: "https://duyfb1fyoot3j.cloudfront.net/svg/n3/javascript.json",
      streamUrlArabic: "https://ai.photogood.site/live/event3/playlist.m3u8?token=1775966413_c5315a1fec067a88d378b9c0daff265566b9cd82404b5fc973d467294d0d5015",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },


    {
      team1: { name: "Liverpool", logo: "https://imgs.ysscores.com/teams/128/4081724601375.png" },
      team2: { name: "Fulham", logo: "https://imgs.ysscores.com/teams/128/4711690118927.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      competitionName: "Premier League - ENGLAND",
      matchTime: '2026-04-11T17:30:00',
      streamUrlEnglish: "https://1syrialive.s3.us-east-2.amazonaws.com/bein2/bein2_1080p/index.m3u8",
      streamUrlArabic: "https://storage.googleapis.com/obrixaovertung2/mux_video_ts1/index-1.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },


    
   {
      team1: { name: "Barcelona", logo: "https://imgs.ysscores.com/teams/128/9541690196746.png" },
      team2: { name: "Espanyol", logo: "https://imgs.ysscores.com/teams/128/4481690370529.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png",
      competitionName: "La Liga - SPAIN",
      matchTime: '2026-04-11T17:30:00',
      streamUrlEnglish: "https://1syrialive.s3.us-east-2.amazonaws.com/bein1/bein1_1080p/index.m3u8",
      streamUrlArabic: "https://duyfb1fyoot3j.cloudfront.net/svg/n2/javascript.json",
      streamUrlServer3: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F61563742538654%2Fvideos%2F26103282212701169%2F",
      streamUrlServer4: ""
    },
   



     {
      team1: { name: "St. Pauli", logo: "https://imgs.ysscores.com/teams/128/6091690370514.png" },
      team2: { name: "Bayern Munich", logo: "https://imgs.ysscores.com/teams/128/2351690288818.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/54.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/54.png",
      competitionName: "Bundesliga - GERMANY",
      matchTime: '2026-04-11T17:30:00',
      streamUrlEnglish: "https://1syrialive.s3.us-east-2.amazonaws.com/shahid1/shahid1_1080p/index.m3u8",
      streamUrlArabic: "https://smarthard.click/hls/8r59wy2BRApK/index.m3u8",
      streamUrlServer3: "",
      streamUrlServer4: ""
    },



     {
      team1: { name: "Atalanta", logo: "https://imgs.ysscores.com/teams/128/3541690283001.png" },
      team2: { name: "Juventus", logo: "https://imgs.ysscores.com/teams/128/9331690283003.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/55.png",
      competitionName: "Serie A - ITALY",
      matchTime: '2026-04-11T19:45:00',
      streamUrlEnglish: "https://yskylive.netlify.app/bein2",
      streamUrlArabic: "https://storage.googleapis.com/uhgertyobrixaovo3/mux_video_ts1/index-1.m3u8",
      streamUrlServer3: "https://d3h8gvxs6hajby.cloudfront.net/status/2/fronts.woff2?84e3b4",
      streamUrlServer4: "https://is.gd/QKWLVe.m3u8"
    },


 {
      team1: { name: "Sevilla", logo: "https://imgs.ysscores.com/teams/128/6931690196743.png" },
      team2: { name: "Atlético", logo: "https://imgs.ysscores.com/teams/128/1431719588699.png" },
      competitionLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png",
      competitionDarkLogo: "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/87.png",
      competitionName: "La Liga - SPAIN",
      matchTime: '2026-04-11T20:00:00',
      streamUrlEnglish: "https://yskylive.netlify.app/bein2",
      streamUrlArabic: "https://storage.googleapis.com/uhgertyobrixaovo3/mux_video_ts1/index-1.m3u8",
      streamUrlServer3: "https://d3h8gvxs6hajby.cloudfront.net/status/2/fronts.woff2?84e3b4",
      streamUrlServer4: "https://is.gd/QKWLVe.m3u8"
    },
   

     

    


  ];
  
}

export default Index;
