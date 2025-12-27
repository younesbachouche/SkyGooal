import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StandingsTableProps {
  standings: any[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to get team logo URL from 365scores API data
const getTeamLogoUrl = (competitor: any): string => {
  if (!competitor) return 'https://via.placeholder.com/32?text=?';
  
  // 365scores uses this pattern for team logos
  const teamId = competitor.id;
  const imageVersion = competitor.imageVersion || 1;
  
  if (teamId) {
    return `https://imagecache.365scores.com/image/upload/f_png,w_48,h_48,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v${imageVersion}/Competitors/${teamId}`;
  }
  
  return 'https://via.placeholder.com/32?text=?';
};

const StandingsTable = ({ standings, isLoading, error }: StandingsTableProps) => {
  if (error) {
    return (
      <div className="sports-card-static p-8 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-muted-foreground text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="sports-card-static overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <Skeleton className="h-4 w-32" />
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-border/30">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="sports-card-static p-8 text-center">
        <p className="text-muted-foreground">No standings data available</p>
      </div>
    );
  }

  return (
    <div className="sports-card-static overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="grid grid-cols-[40px_1fr_40px_40px_40px_50px] gap-2 px-4 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span className="text-center">#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">GD</span>
        <span className="text-center hidden sm:block">W</span>
        <span className="text-center font-bold">Pts</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/30">
        {standings.map((team: any, index: number) => {
          const position = team.position || index + 1;
          const isTop4 = position <= 4;
          const isRelegation = position >= standings.length - 2;
          
          return (
            <div 
              key={team.id || index}
              className={`grid grid-cols-[40px_1fr_40px_40px_40px_50px] gap-2 px-4 py-3 items-center
                transition-colors duration-200 hover:bg-muted/30
                ${isTop4 ? 'border-l-2 border-l-primary' : ''}
                ${isRelegation ? 'border-l-2 border-l-destructive' : ''}`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Position */}
              <span className={`text-center text-sm font-bold
                ${isTop4 ? 'text-primary' : ''}
                ${isRelegation ? 'text-destructive' : ''}`}>
                {position}
              </span>
              
              {/* Team */}
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={getTeamLogoUrl(team.competitor)}
                  alt={team.competitor?.name || team.teamName}
                  className="w-7 h-7 object-contain flex-shrink-0 rounded-full bg-muted p-0.5"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/32?text=?';
                  }}
                />
                <span className="text-sm font-medium truncate">
                  {team.competitor?.name || team.teamName || 'Unknown'}
                </span>
              </div>
              
              {/* Played */}
              <span className="text-center text-sm text-muted-foreground">
                {team.gamePlayed || team.played || '-'}
              </span>
              
              {/* Goal Difference */}
              <span className={`text-center text-sm font-medium
                ${(team.ratio || 0) > 0 ? 'text-primary' : ''}
                ${(team.ratio || 0) < 0 ? 'text-destructive' : ''}`}>
                {(team.ratio || 0) > 0 ? '+' : ''}{Math.round(team.ratio || 0)}
              </span>
              
              {/* Wins - Hidden on mobile */}
              <span className="text-center text-sm text-muted-foreground hidden sm:block">
                {team.gamesWon || team.wins || '-'}
              </span>
              
              {/* Points */}
              <span className="text-center text-sm font-bold text-foreground bg-muted/50 rounded-lg py-1">
                {team.points || team.pts || 0}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Champions League</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span>Relegation</span>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
