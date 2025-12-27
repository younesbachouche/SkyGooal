import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupStandingsTableProps {
  standings: any[];
  isLoading: boolean;
  error: string | null;
}

const getTeamLogoUrl = (competitor: any): string => {
  if (!competitor) return 'https://via.placeholder.com/32?text=?';
  
  const teamId = competitor.id;
  const imageVersion = competitor.imageVersion || 1;
  
  if (teamId) {
    return `https://imagecache.365scores.com/image/upload/f_png,w_48,h_48,c_limit,q_auto:eco,dpr_2,d_Competitors:default1.png/v${imageVersion}/Competitors/${teamId}`;
  }
  
  return 'https://via.placeholder.com/32?text=?';
};

const GroupStandingsTable = ({ standings, isLoading, error }: GroupStandingsTableProps) => {
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
      <div className="space-y-4">
        {[...Array(6)].map((_, groupIndex) => (
          <div key={groupIndex} className="sports-card-static overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <Skeleton className="h-5 w-24" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-b border-border/30">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
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

  // Group teams by their group name
  const groupedStandings: { [key: string]: any[] } = {};
  
  standings.forEach((team: any) => {
    const groupName = team.groupName || team.group || 'Group';
    if (!groupedStandings[groupName]) {
      groupedStandings[groupName] = [];
    }
    groupedStandings[groupName].push(team);
  });

  // Preserve API order of groups (insertion order)
  const sortedGroups = Object.keys(groupedStandings);

  return (
    <div className="space-y-4">
      {sortedGroups.map((groupName) => {
        const teams = groupedStandings[groupName];
        
        return (
          <div key={groupName} className="sports-card-static overflow-hidden animate-fade-in">
            {/* Group Header */}
            <div className="px-4 py-3 bg-primary/10 border-b border-border/50">
              <h3 className="font-bold text-primary">{groupName}</h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-[32px_1fr_36px_36px_36px_44px] gap-1 px-3 py-2 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="text-center">#</span>
              <span>Team</span>
              <span className="text-center">P</span>
              <span className="text-center">GD</span>
              <span className="text-center">W</span>
              <span className="text-center">Pts</span>
            </div>

            {/* Teams */}
            <div className="divide-y divide-border/30">
              {teams.map((team: any, index: number) => {
                const position = team.position || index + 1;
                const isQualifying = position <= 2;
                
                return (
                  <div 
                    key={team.competitor?.id || index}
                    className={`grid grid-cols-[32px_1fr_36px_36px_36px_44px] gap-1 px-3 py-2.5 items-center
                      transition-colors duration-200 hover:bg-muted/30
                      ${isQualifying ? 'border-l-2 border-l-primary' : ''}`}
                  >
                    {/* Position */}
                    <span className={`text-center text-sm font-bold ${isQualifying ? 'text-primary' : ''}`}>
                      {position}
                    </span>
                    
                    {/* Team */}
                    <div className="flex items-center gap-2 min-w-0">
                      <img 
                        src={getTeamLogoUrl(team.competitor)}
                        alt={team.competitor?.name}
                        className="w-6 h-6 object-contain flex-shrink-0 rounded-full bg-muted p-0.5"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/32?text=?';
                        }}
                      />
                      <span className="text-xs font-medium truncate">
                        {team.competitor?.name || team.competitor?.symbolicName || 'Unknown'}
                      </span>
                    </div>
                    
                    {/* Played */}
                    <span className="text-center text-xs text-muted-foreground">
                      {team.gamePlayed || team.played || '0'}
                    </span>
                    
                    {/* Goal Difference */}
                    <span className={`text-center text-xs font-medium
                      ${(team.ratio || 0) > 0 ? 'text-primary' : ''}
                      ${(team.ratio || 0) < 0 ? 'text-destructive' : ''}`}>
                      {(team.ratio || 0) > 0 ? '+' : ''}{Math.round(team.ratio || 0)}
                    </span>
                    
                    {/* Wins */}
                    <span className="text-center text-xs text-muted-foreground">
                      {team.gamesWon || team.wins || '0'}
                    </span>
                    
                    {/* Points */}
                    <span className="text-center text-xs font-bold text-foreground bg-muted/50 rounded py-0.5">
                      {Math.round(team.points || 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Qualification</span>
        </div>
      </div>
    </div>
  );
};

export default GroupStandingsTable;
