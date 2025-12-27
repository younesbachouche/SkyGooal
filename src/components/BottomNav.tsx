import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Trophy, BarChart3 } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    { 
      id: 'matches', 
      label: 'Matches', 
      icon: Calendar, 
      path: '/' 
    },
    { 
      id: 'standings', 
      label: 'Standings', 
      icon: Trophy, 
      path: '/standings' 
    },
    { 
      id: 'stats', 
      label: 'Stats', 
      icon: BarChart3, 
      path: '/stats' 
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 z-50"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
      <div className="flex items-center justify-around py-1.5">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 py-2 px-8 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground active:text-foreground'
                }`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
