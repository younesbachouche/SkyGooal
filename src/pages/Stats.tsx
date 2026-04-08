import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Moon, Sun, Target, Footprints, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PullToRefresh from '@/components/PullToRefresh';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// ---------------- Types ----------------
interface Competition {
  id: string;
  name: string;
  logo: string;
  apiUrl: string;
}

interface StatItem {
  typeId: number;
  value: string | number;
}

interface Athlete {
  id: number;
  name: string;
  competitorId?: number;
  positionName?: string;
}

interface AthleteStatRow {
  entity: Athlete;
  stats: StatItem[];
  value?: string | number;
}

interface AthleteStatCategory {
  id: number;
  name: string;
  rows: AthleteStatRow[];
}

interface StatsData {
  stats: {
    athletesStats: AthleteStatCategory[];
  };
}

// ---------------- Competitions ----------------
const competitions: Competition[] = [

     {
    id: 'Champions League',
    name: 'Champions League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:19.png/v5/Competitions/light/572',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=572&competitors=&withSeasons=true'
  },
 
  {
    id: 'ligue1-mobilis',
    name: 'Ligue 1 Mobilis',
    logo: 'https://images.fotmob.com/image_resources/logo/leaguelogo/516.png',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=10&userCountryId=139&competitions=560&competitors=&withSeasons=true'
  },
  {
    id: 'La Liga',
    name: 'La Liga',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:2.png/v5/Competitions/light/11',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=10&userCountryId=139&competitions=11&competitors=&withSeasons=true'
  },

  {
    id: 'Premier League',
    name: 'Premier League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:1.png/v12/Competitions/light/7',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=7&competitors=&withSeasons=true'
  },
   {
    id: 'Serie A',
    name: 'Serie A',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:3.png/v3/Competitions/light/17',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=17&competitors=&withSeasons=true'
  },
   {
    id: 'Bundesliga',
    name: 'Bundesliga',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:4.png/v2/Competitions/light/25',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=25&competitors=&withSeasons=true'
  },
  {
    id: 'Ligue 1',
    name: 'Ligue 1',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:5.png/v5/Competitions/light/35',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=35&competitors=&withSeasons=true'
  },
   
  {
    id: 'Eredivisie 1',
    name: 'Eredivisie',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:5.png/v5/Competitions/light/57',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=57&competitors=&withSeasons=true'
  },
   {
    id: 'afcon',
    name: 'AFCON 2025',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,d_Countries:Round:44.png/v11/Competitions/light/167',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=10&userCountryId=139&competitions=167&competitors=&withSeasons=true'
  },
   {
    id: 'Europa League 1',
    name: 'Europa League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:19.png/v8/Competitions/light/573',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=573&competitors=&withSeasons=true'
  },
  {
    id: 'Conference League 1',
    name: 'Conference League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:19.png/v6/Competitions/light/7685',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=7685&competitors=&phaseNum=-1&withSeasons=true'
  },
  {
    id: 'Tunisian League 1',
    name: 'Tunisian League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Countries:Round:19.png/v6/Competitions/light/7685',
    apiUrl: 'https://webws.365scores.com/web/stats/?appTypeId=5&langId=1&timezoneName=Africa/Lagos&userCountryId=139&competitions=7685&competitors=&phaseNum=-1&withSeasons=true'
  },

];

const fetchStats = async (apiUrl: string): Promise<StatsData> => {
  const res = await fetch(apiUrl);
  const data = await res.json();
  return data;
};

const getPlayerImageUrl = (playerId: number) =>
  `https://imagecache.365scores.com/image/upload/f_png,w_100,h_100,c_limit,q_auto:eco,d_Athletes:default.png/v5/Athletes/${playerId}`;

const getTeamLogoUrl = (competitorId: number) =>
  `https://imagecache.365scores.com/image/upload/f_png,w_40,h_40,c_limit,q_auto:eco,d_Competitors:default1.png/v5/Competitors/${competitorId}`;

// ---------------- Component ----------------
const Stats: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition>(competitions[0]);
  const [activeTab, setActiveTab] = useState<string>('goals');

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', String(newMode));
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newMode;
    });
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['stats', selectedCompetition.id],
    queryFn: () => fetchStats(selectedCompetition.apiUrl),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // ---------------- Dynamic Stats Parsing ----------------
  const statCategories = useMemo(() => {
    const athletesStats = data?.stats?.athletesStats || [];

    const transformRows = (category: AthleteStatCategory | undefined) =>
      category?.rows.map(row => ({
        ...row,
        value: row.stats?.[0]?.value ?? '0', // pick the first stat value dynamically
      })) || [];

    // Find categories dynamically by name (case-insensitive)
    const findCategory = (names: string[]) =>
      athletesStats.find(cat => names.map(n => n.toLowerCase()).includes(cat.name.toLowerCase()));

    return {
      goals: transformRows(findCategory(['Goals', 'Goal', 'Goals Scored'])),
      assists: transformRows(findCategory(['Assists', 'Assist'])),
      xg: transformRows(findCategory(['Expected Goals', 'xG'])),
      xa: transformRows(findCategory(['Expected Assists', 'xA'])),
    };
  }, [data]);

  // ---------------- Renderers ----------------
  const renderStatCard = (player: AthleteStatRow, index: number) => (
    <div
      key={player.entity.id}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        index === 0 ? 'bg-accent/10 border border-accent/30' :
        index === 1 ? 'bg-secondary/10 border border-secondary/30' :
        index === 2 ? 'bg-primary/10 border border-primary/30' :
        'bg-muted/50'
      }`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
        index === 0 ? 'bg-accent text-accent-foreground' :
        index === 1 ? 'bg-secondary text-secondary-foreground' :
        index === 2 ? 'bg-primary text-primary-foreground' :
        'bg-muted text-muted-foreground'
      }`}>
        {index + 1}
      </div>

      <img
        src={getPlayerImageUrl(player.entity.id)}
        alt={player.entity.name}
        className="w-12 h-12 rounded-full object-cover bg-muted"
        onError={(e) => { (e.target as HTMLImageElement).src = getPlayerImageUrl(0); }}
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{player.entity.name}</p>
        {player.entity.competitorId && (
          <div className="flex items-center gap-2">
            <img
              src={getTeamLogoUrl(player.entity.competitorId)}
              alt=""
              className="w-4 h-4 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p className="text-xs text-muted-foreground truncate">{player.entity.positionName}</p>
          </div>
        )}
      </div>

      <div className={`text-xl font-bold ${
        index === 0 ? 'text-accent' :
        index === 1 ? 'text-secondary' :
        index === 2 ? 'text-primary' :
        'text-foreground'
      }`}>
        {player.value}
      </div>
    </div>
  );

  const renderStatsList = (stats: AthleteStatRow[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-8 h-6" />
            </div>
          ))}
        </div>
      );
    }

    if (!stats || stats.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {stats.slice(0, 20).map(renderStatCard)}
      </div>
    );
  };

  // ---------------- JSX ----------------
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={selectedCompetition.logo} alt={selectedCompetition.name} className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-foreground">Stats</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching} className="h-9 w-9">
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </div>

        {/* Competition Filter */}
        <div className="px-4 pb-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2.5 pb-1">
              {competitions.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetition(comp)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 flex-shrink-0
                    ${selectedCompetition.id === comp.id
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30 scale-105 border-2 border-primary/50'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border/50 hover:border-primary/30 hover:scale-[1.02]'
                    }`}
                >
                  <img 
                    src={comp.logo} 
                    alt={comp.name} 
                    className={`w-5 h-5 sm:w-6 sm:h-6 object-contain transition-transform duration-300 ${selectedCompetition.id === comp.id ? 'scale-110' : ''}`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/24?text=?';
                    }}
                  />
                  <span className="text-xs sm:text-sm font-semibold">{comp.name}</span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5 bg-slate-200 dark:bg-slate-700" />
          </ScrollArea>
        </div>
      </header>

      <PullToRefresh onRefresh={handleRefresh}>
        <main className="px-4 py-4">
          {error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load stats. Please try again.</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-4 h-auto p-1">
                <TabsTrigger value="goals" className="flex items-center gap-1.5 py-2"><Target size={16} /> <span className="text-xs sm:text-sm">Goals</span></TabsTrigger>
                <TabsTrigger value="assists" className="flex items-center gap-1.5 py-2"><Footprints size={16} /> <span className="text-xs sm:text-sm">Assists</span></TabsTrigger>
                <TabsTrigger value="xg" className="flex items-center gap-1.5 py-2"><Award size={16} /> <span className="text-xs sm:text-sm">xG</span></TabsTrigger>
                <TabsTrigger value="xa" className="flex items-center gap-1.5 py-2"><Award size={16} /> <span className="text-xs sm:text-sm">xA</span></TabsTrigger>
              </TabsList>

              <TabsContent value="goals">{renderStatsList(statCategories.goals, 'No goals data available yet')}</TabsContent>
              <TabsContent value="assists">{renderStatsList(statCategories.assists, 'No assists data available yet')}</TabsContent>
              <TabsContent value="xg">{renderStatsList(statCategories.xg, 'No xG data available yet')}</TabsContent>
              <TabsContent value="xa">{renderStatsList(statCategories.xa, 'No xA data available yet')}</TabsContent>
            </Tabs>
          )}
        </main>
      </PullToRefresh>
    </div>
  );
};

export default Stats;
