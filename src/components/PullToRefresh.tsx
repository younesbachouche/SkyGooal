import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
}

const PullToRefresh = ({ onRefresh, children, className = '' }: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance to the pull
      const resistance = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(resistance);
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center z-10 pointer-events-none transition-opacity duration-200"
        style={{ 
          top: pullDistance - 40,
          opacity: pullDistance > 20 ? 1 : 0
        }}
      >
        <div 
          className={`w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center
            ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ 
            transform: `rotate(${progress * 360}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s'
          }}
        >
          <RefreshCw 
            size={20} 
            className={`text-primary ${pullDistance >= PULL_THRESHOLD ? 'text-primary' : 'text-muted-foreground'}`}
          />
        </div>
      </div>
      
      {/* Content with pull offset */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
