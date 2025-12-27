import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Team {
  name: string;
  logo: string;
}

interface Match {
  team1: Team;
  team2: Team;
  competitionName: string;
  matchTime: string;
}

interface LiveTickerProps {
  matches: Match[];
  onMatchClick?: (match: Match) => void;
}

const LiveTicker = ({ matches, onMatchClick }: LiveTickerProps) => {
  if (matches.length === 0) return null;

  return (
    <div className="bg-destructive/10 border-b border-destructive/20">
      <div className="px-3 py-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-semibold text-destructive uppercase tracking-wide">Live Now</span>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-1">
            {matches.map((match, index) => (
              <button
                key={index}
                onClick={() => onMatchClick?.(match)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/50 
                  hover:border-destructive/50 transition-all duration-200 flex-shrink-0 shadow-sm"
              >
                {/* Team 1 */}
                <div className="flex items-center gap-1.5">
                  <img 
                    src={match.team1.logo} 
                    alt={match.team1.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/20?text=?';
                    }}
                  />
                  <span className="text-xs font-medium max-w-[60px] truncate">
                    {match.team1.name.split(' ')[0]}
                  </span>
                </div>
                
                {/* VS */}
                <span className="text-[10px] text-destructive font-bold px-1">VS</span>
                
                {/* Team 2 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium max-w-[60px] truncate">
                    {match.team2.name.split(' ')[0]}
                  </span>
                  <img 
                    src={match.team2.logo} 
                    alt={match.team2.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/20?text=?';
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default LiveTicker;
