import React, { useState, useEffect, useRef } from 'react';
import { Reel } from '@/types/reel';
import { getReels } from '@/services/reelService';
import ReelCard from './ReelCard';

const ReelsViewer: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // For touch swipe functionality
  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 50; // Minimum pixels to be considered a swipe

  useEffect(() => {
    const unsubscribe = getReels((fetchedReels) => {
      setReels(fetchedReels);
      setIsLoading(false);
    });

    return () => {
      // Firebase onValue might not return a direct unsubscribe function in some SDK versions.
      // If `getReels` provides a specific unsubscribe mechanism, it should be used here.
      // Assuming the listener is cleaned up appropriately as per the original comment.
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Mouse Wheel Scroll ---
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

    // --- Keyboard Navigation ---
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < reels.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    // --- Touch Swipe Navigation ---
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default scrolling behavior while swiping
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === 0) return; // No touch start recorded

      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY; // Positive for swipe up, negative for swipe down

      if (deltaY > SWIPE_THRESHOLD && currentIndex < reels.length - 1) {
        // Swipe up (navigate to next reel)
        setCurrentIndex(prev => prev + 1);
      } else if (deltaY < -SWIPE_THRESHOLD && currentIndex > 0) {
        // Swipe down (navigate to previous reel)
        setCurrentIndex(prev => prev - 1);
      }
      
      touchStartY.current = 0; // Reset for the next touch
    };

    // Add event listeners
    container.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    // Cleanup event listeners
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleScroll);
        window.removeEventListener('keydown', handleKeyDown);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, reels.length]); // Dependencies for re-binding if index or reels count changes

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
        <div key={reel.id} className="h-screen w-full flex items-center justify-center">
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
          Swipe, scroll, or use ↑↓ keys to navigate
        </p>
      </div>
    </div>
  );
};

export default ReelsViewer;
