import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { League } from '@/data/leagues';

interface LeagueFilterProps {
  leagues: League[];
  selectedLeague: League;
  onSelectLeague: (league: League) => void;
}

const LeagueFilter = ({ leagues, selectedLeague, onSelectLeague }: LeagueFilterProps) => {
  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2.5 pb-3 px-1">
          {leagues.map((league) => {
            const isSelected = league.id === selectedLeague.id;
            
            return (
              <button
                key={league.id}
                onClick={() => onSelectLeague(league)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300
                  text-xs sm:text-sm font-semibold flex-shrink-0
                  ${isSelected 
                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-105 border-2 border-primary/50' 
                    : 'bg-card hover:bg-muted/80 border border-border/50 hover:border-primary/30 hover:scale-[1.02]'
                  }`}
              >
                <img 
                  src={league.logo} 
                  alt={league.name}
                  className={`w-5 h-5 sm:w-6 sm:h-6 object-contain transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/24?text=?';
                  }}
                />
                <span className="truncate max-w-[100px] sm:max-w-[120px]">{league.name}</span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5 bg-slate-200 dark:bg-slate-700" />
      </ScrollArea>
    </div>
  );
};

export default LeagueFilter;
