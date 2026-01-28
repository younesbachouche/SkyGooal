import React, { useState, useEffect } from "react";

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

const MatchCard = ({ match, onOpenStream, isEnded = false }: MatchProps) => {
  const [matchStatus, setMatchStatus] = useState<"upcoming" | "starting-soon" | "live" | "ended">(
    isEnded ? "ended" : "upcoming"
  );
  const [countdown, setCountdown] = useState("00:00:00");

  useEffect(() => {
    const updateStatus = () => {
      const now = Date.now();
      const start = new Date(match.matchTime).getTime();
      const end = start + 2 * 60 * 60 * 1000; // 2 hours

      if (now >= end) {
        setMatchStatus("ended");
      } else if (now >= start) {
        setMatchStatus("live");
      } else if (now >= start - 30 * 60 * 1000) {
        setMatchStatus("starting-soon");
      } else {
        setMatchStatus("upcoming");

        const diff = start - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [match.matchTime, isEnded]);

  const convertToLocalTime = (time: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(
        new Date(time)
      );
    } catch {
      const matchTime = time.match(/T(\d{2}):(\d{2})/);
      return matchTime ? `${matchTime[1]}:${matchTime[2]}` : time;
    }
  };

  const handleOpenStream = () => {
    onOpenStream(match.streamUrlEnglish, match.streamUrlArabic, match.streamUrlServer3, match.streamUrlServer4);
  };

  const StatusIndicator = () => {
    switch (matchStatus) {
      case "live":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">LIVE</span>
          </div>
        );
      case "starting-soon":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">SOON</span>
          </div>
        );
      case "ended":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ENDED</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Competition Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={document.documentElement.classList.contains("dark") ? match.competitionDarkLogo : match.competitionLogo}
            alt="Competition"
            className="w-4 h-4"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><path d="M4 6h16v12H4z"/></svg>';
            }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{match.competitionName}</span>
        </div>
        <StatusIndicator />
      </div>

      {/* Match Content */}
      <div className="p-4 flex items-center justify-between">
        {/* Team 1 */}
        <div className="flex flex-col items-center flex-1">
          <img
            src={match.team1.logo}
            alt={match.team1.name}
            className="w-12 h-12 mb-2"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><circle cx="12" cy="12" r="10"/></svg>';
            }}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{match.team1.name}</span>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center mx-4 min-w-[100px]">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{convertToLocalTime(match.matchTime)}</div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">VS</div>

          {/* Fixed space for buttons/countdown */}
          <div className="h-10 flex items-center justify-center">
            {matchStatus === "upcoming" && (
              <div className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">{countdown}</div>
            )}
            {matchStatus === "starting-soon" && (
              <button
                onClick={handleOpenStream}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                Starts Soon
              </button>
            )}
            {matchStatus === "live" && (
              <button
                onClick={handleOpenStream}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md flex items-center gap-2 transition-colors"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
                LIVE NOW
              </button>
            )}
            {matchStatus === "ended" && (
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-md">
                Ended
              </div>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center flex-1">
          <img
            src={match.team2.logo}
            alt={match.team2.name}
            className="w-12 h-12 mb-2"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><circle cx="12" cy="12" r="10"/></svg>';
            }}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{match.team2.name}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
