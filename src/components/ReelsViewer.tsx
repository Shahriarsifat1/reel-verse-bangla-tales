
import React, { useState, useEffect, useRef } from 'react';
import { Reel } from '@/types/reel';
import { getReels } from '@/services/reelService';
import ReelCard from './ReelCard';

const ReelsViewer: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = getReels((fetchedReels) => {
      setReels(fetchedReels);
      setIsLoading(false);
    });

    return () => {
      // Firebase onValue returns undefined, so we can't unsubscribe directly
      // The listener will be automatically cleaned up when the component unmounts
    };
  }, []);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 0 && currentIndex < reels.length - 1) {
        // Scroll down
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        // Scroll up
        setCurrentIndex(prev => prev - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < reels.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleScroll);
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [currentIndex, reels.length]);

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Loading Reels...</h2>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Reels Available</h2>
          <p className="text-lg opacity-75">Ask admin to add some reels!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-hidden relative bg-black"
      style={{
        transform: `translateY(-${currentIndex * 100}vh)`,
        transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {reels.map((reel, index) => (
        <div key={reel.id} className="h-screen">
          <ReelCard 
            reel={reel} 
            isActive={index === currentIndex}
          />
        </div>
      ))}
      
      {/* Navigation indicators */}
      <div className="fixed right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-50">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center z-40">
        <p className="text-sm opacity-75">
          Scroll or use ↑↓ keys to navigate
        </p>
      </div>
    </div>
  );
};

export default ReelsViewer;
