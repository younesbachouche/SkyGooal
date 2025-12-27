import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { leagues, League } from '@/data/leagues';
import LeagueFilter from '@/components/LeagueFilter';
import StandingsTable from '@/components/StandingsTable';
import GroupStandingsTable from '@/components/GroupStandingsTable';
import PullToRefresh from '@/components/PullToRefresh';

interface StandingsData {
  rows: any[];
  hasGroups: boolean;
}

const fetchStandings = async (apiUrl: string, hasGroups?: boolean): Promise<StandingsData> => {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch standings');
  }
  const data = await response.json();
  
  // Parse the API response
  if (data.standings && data.standings.length > 0) {
    // Check if it's group standings (multiple standing groups)
    if (hasGroups || data.standings.length > 1) {
      // Combine all groups with group names
      const allRows: any[] = [];
      data.standings.forEach((standing: any) => {
        const groupName = standing.displayName || standing.groupName || 'Group';
        const rows = standing.rows || [];
        rows.forEach((row: any) => {
          allRows.push({
            ...row,
            groupName: groupName
          });
        });
      });
      return { rows: allRows, hasGroups: true };
    }
    
    return { 
      rows: data.standings[0]?.rows || data.standings[0]?.competitors || [],
      hasGroups: false
    };
  }
  return { rows: [], hasGroups: false };
};

const Standings = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedLeague, setSelectedLeague] = useState<League>(leagues[0]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("dark-mode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

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

  const { data: standingsData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['standings', selectedLeague.id],
    queryFn: () => fetchStandings(selectedLeague.apiUrl, selectedLeague.hasGroups),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Normalize AFCON groups to A-F with 4 teams each
  const getDisplayStandings = () => {
    if (!standingsData) return standingsData;

    if (selectedLeague.id === 'afcon' && standingsData.hasGroups) {
      const groups: { [k: string]: any[] } = { A: [], B: [], C: [], D: [], E: [], F: [] };

      standingsData.rows.forEach((row: any) => {
        const raw = (row.groupName || row.group || '').toString();
        let letter: string | null = null;
        const match = raw.match(/([A-F])/i);
        if (match) letter = match[1].toUpperCase();

        if (!letter) {
          const gMatch = raw.match(/Group\s*([A-F])/i);
          if (gMatch) letter = gMatch[1].toUpperCase();
        }

        // Remap groups as requested: A->B, C->A, B->C, D->D, E->F, F->E
        const groupMapping: { [key: string]: string } = {
          'A': 'B',
          'C': 'A', 
          'B': 'C',
          'D': 'D',
          'E': 'F',
          'F': 'E'
        };

        const mappedLetter = letter ? groupMapping[letter] : null;

        if (mappedLetter && groups[mappedLetter] && groups[mappedLetter].length < 4) {
          groups[mappedLetter].push(row);
        } else {
          // distribute to first available slot
          for (const key of Object.keys(groups)) {
            if (groups[key].length < 4) {
              groups[key].push(row);
              break;
            }
          }
        }
      });

      const flattened: any[] = [];
      Object.keys(groups).forEach((key) => {
        const groupRows = groups[key].slice(0, 4);
        groupRows.forEach((r) => flattened.push({ ...r, groupName: `Group ${key}` }));
      });

      return { ...standingsData, rows: flattened };
    }

    return standingsData;
  };

  const displayStandingsData = getDisplayStandings();

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Standings
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {selectedLeague.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                className="rounded-full"
              >
                <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
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

      <main className="px-3 sm:px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* League Filter */}
        <LeagueFilter 
          leagues={leagues}
          selectedLeague={selectedLeague}
          onSelectLeague={setSelectedLeague}
        />

        {/* Standings Table - Conditional rendering based on group type */}
        {displayStandingsData?.hasGroups ? (
          <GroupStandingsTable 
            standings={displayStandingsData.rows}
            isLoading={isLoading}
            error={error ? 'Failed to load standings' : null}
          />
        ) : (
          <StandingsTable 
            standings={displayStandingsData?.rows || []}
            isLoading={isLoading}
            error={error ? 'Failed to load standings' : null}
          />
        )}
      </main>
    </PullToRefresh>
  );
};

export default Standings;
