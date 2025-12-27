import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Competition {
  name: string;
  logo: string;
}

interface CompetitionFilterProps {
  competitions: Competition[];
  selectedCompetition: string | null;
  onSelectCompetition: (name: string | null) => void;
}

const CompetitionFilter = ({ competitions, selectedCompetition, onSelectCompetition }: CompetitionFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-3 px-1">
        {/* All option */}
        <button
          onClick={() => onSelectCompetition(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200
            text-xs sm:text-sm font-medium flex-shrink-0
            ${selectedCompetition === null 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'bg-card hover:bg-muted border border-border/50'
            }`}
        >
          All
        </button>
        
        {competitions.map((comp) => {
          const isSelected = selectedCompetition === comp.name;
          
          return (
            <button
              key={comp.name}
              onClick={() => onSelectCompetition(comp.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200
                text-xs sm:text-sm font-medium flex-shrink-0
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card hover:bg-muted border border-border/50'
                }`}
            >
              <img 
                src={comp.logo} 
                alt={comp.name}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/16?text=?';
                }}
              />
              <span className="truncate max-w-[80px] sm:max-w-[100px]">{comp.name}</span>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-1.5" />
    </ScrollArea>
  );
};

export default CompetitionFilter;
