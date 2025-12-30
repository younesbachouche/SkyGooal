import React, { useState, useEffect, useRef } from "react";

interface Team {
  name: string;
  logo: string;
}

interface MatchProps {
  match: {
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
  };
  index: number;
  onOpenStream: (englishUrl: string, arabicUrl: string, server3Url: string, server4Url?: string) => void;
  isEnded?: boolean;
}

const MatchCard = ({ match, index, onOpenStream, isEnded = false }: MatchProps) => {
  const [matchStatus, setMatchStatus] = useState<"upcoming" | "starting-soon" | "live" | "ended">(
    isEnded ? "ended" : "upcoming"
  );
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      let matchStartTime: number;
      if (match.matchTime.includes('T') && (match.matchTime.includes('Z') || match.matchTime.includes('+'))) {
        matchStartTime = new Date(match.matchTime).getTime();
      } else {
        matchStartTime = new Date(match.matchTime).getTime();
      }
      
      const matchEndTime = matchStartTime + 2 * 60 * 60 * 1000;
      const currentTime = new Date().getTime();

      if (currentTime >= matchEndTime) {
        setMatchStatus("ended");
      } else if (currentTime >= matchStartTime - 5 * 60 * 1000) {
        setMatchStatus("live");
      } else if (currentTime >= matchStartTime - 30 * 60 * 1000) {
        setMatchStatus("starting-soon");
      } else {
        setMatchStatus("upcoming");
        
        let remainingTime = matchStartTime - currentTime;
        let hours = Math.floor(remainingTime / (1000 * 60 * 60));
        let minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        
        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const formattedSeconds = seconds.toString().padStart(2, "0");
        
        setCountdown(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
        setRemainingSeconds(hours * 3600 + minutes * 60 + seconds);
      }
    };

    updateStatus();
    const intervalId = setInterval(updateStatus, 1000);
    return () => clearInterval(intervalId);
  }, [match.matchTime, isEnded]);

  const convertToLocalTime = (matchTime: string) => {
    if (matchTime.includes('T') && matchTime.endsWith('Z')) {
      const timeMatch = matchTime.match(/T(\d{2}):(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
    }
    
    try {
      const matchDate = new Date(matchTime);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: userTimezone
      };
      
      return new Intl.DateTimeFormat(undefined, options).format(matchDate);
    } catch (e) {
      const timeMatch = matchTime.match(/T(\d{2}):(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
      return matchTime;
    }
  };

  const handleOpenStream = () => {
    onOpenStream(match.streamUrlEnglish, match.streamUrlArabic, match.streamUrlServer3, match.streamUrlServer4);
  };

  const getAnimationProgress = () => {
    const totalSeconds = 3600 * 3;
    const progress = (remainingSeconds / totalSeconds) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div 
      className={`
        relative bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg 
        overflow-hidden backdrop-blur-sm
        transition-all duration-300 transform hover:-translate-y-1
        ${isEnded ? 'opacity-70' : 'hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20'}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative p-3 sm:p-5 z-10">
        {/* Competition Badge - Top */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="
            inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 
            rounded-full text-xs font-semibold 
            bg-blue-50 dark:bg-blue-900/30 
            text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 
            shadow-sm
            transition-all duration-300 hover:scale-105 hover:shadow-md
          ">
            <img
              src={document.documentElement.classList.contains("dark") ? match.competitionDarkLogo : match.competitionLogo}
              alt="Competition"
              className="w-3.5 h-3.5 sm:w-5 sm:h-5 object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/20?text=?';
              }}
            />
            <span className="truncate max-w-[100px] sm:max-w-[150px]">
              {match.competitionName}
            </span>
          </div>
        </div>

        {/* Teams Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Team 1 */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="
              w-16 h-16 sm:w-24 sm:h-24 rounded-full 
              bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900
              flex items-center justify-center p-1.5 sm:p-2 
              border-2 border-gray-300 dark:border-gray-600 shadow-lg
              transition-all duration-300 hover:scale-105 hover:border-blue-500/30
              relative
            ">
              <img 
                src={match.team1.logo} 
                alt={match.team1.name} 
                className="w-10 h-10 sm:w-16 sm:h-16 object-contain z-10 relative"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48?text=?';
                }}
              />
            </div>
            <p className="mt-2 sm:mt-3 font-bold text-xs sm:text-base text-center leading-tight truncate w-full px-1 sm:px-2 text-gray-900 dark:text-white">
              {match.team1.name}
            </p>
          </div>
          
          {/* Match Status - Center */}
          <div className="flex flex-col items-center justify-center px-1 sm:px-2 min-w-[90px] sm:min-w-[120px]">
            {/* VS Text */}
            <div className="mb-1 sm:mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest">VS</span>
            </div>

            {matchStatus === "upcoming" && (
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  {convertToLocalTime(match.matchTime)}
                </p>
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex justify-center items-center">
                  <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      className="text-gray-300 dark:text-gray-700" 
                      strokeWidth="3" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="45" 
                      cx="50" 
                      cy="50"
                    />
                    <circle 
                      className="text-blue-500 transition-all duration-1000" 
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (100 - getAnimationProgress()) / 100}`}
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="45" 
                      cx="50" 
                      cy="50"
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Starts In</p>
                    <p className="text-[10px] sm:text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {countdown}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {matchStatus === "starting-soon" && (
              <button
                onClick={handleOpenStream}
                className="
                  relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold
                  bg-gradient-to-r from-green-500 to-emerald-500 
                  text-white shadow-lg shadow-green-500/30
                  transition-all duration-300 hover:scale-105 
                  hover:shadow-xl hover:shadow-green-500/40
                  active:scale-95 overflow-hidden
                "
              >
                <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  <span>Starts Soon</span>
                </div>
              </button>
            )}
            
            {matchStatus === "live" && (
              <button
                onClick={handleOpenStream}
                className="
                  relative px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold
                  bg-gradient-to-r from-red-600 via-red-500 to-red-600 
                  text-white shadow-2xl shadow-red-500/40
                  transition-all duration-300 hover:scale-105 
                  hover:shadow-2xl hover:shadow-red-500/50
                  active:scale-95 overflow-hidden
                  animate-pulse
                "
              >
                <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span className="tracking-wider text-xs sm:text-sm">LIVE NOW</span>
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full" />
              </button>
            )}
            
            {matchStatus === "ended" && (
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                  </svg>
                  <span>Ended</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Team 2 */}
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className="
              w-16 h-16 sm:w-24 sm:h-24 rounded-full 
              bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900
              flex items-center justify-center p-1.5 sm:p-2 
              border-2 border-gray-300 dark:border-gray-600 shadow-lg
              transition-all duration-300 hover:scale-105 hover:border-blue-500/30
              relative
            ">
              <img 
                src={match.team2.logo} 
                alt={match.team2.name} 
                className="w-10 h-10 sm:w-16 sm:h-16 object-contain z-10 relative"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48?text=?';
                }}
              />
            </div>
            <p className="mt-2 sm:mt-3 font-bold text-xs sm:text-base text-center leading-tight truncate w-full px-1 sm:px-2 text-gray-900 dark:text-white">
              {match.team2.name}
            </p>
          </div>
        </div>
      </div>
      
      <video ref={videoRef} className="hidden" playsInline muted />
    </div>
  );
};

export default MatchCard;
