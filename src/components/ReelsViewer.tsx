// @/components/ReelsViewer.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef } from 'react';
import { Reel } from '@/types/reel';
import { getReels } from '@/services/reelService';
import ReelCard from './ReelCard'; // Nishchit koro ei path thik ache
import { ChevronUp, ChevronDown } from 'lucide-react'; // Button icon er jonno

const ReelsViewer: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 50;

  useEffect(() => {
    // console.log("ReelsViewer: useEffect for getReels - MOUNTING or DEPENDENCIES CHANGED. Setting up listener.");
    const unsubscribe = getReels((fetchedReels) => {
      // console.log("ReelsViewer: getReels callback triggered. Fetched Reels Array:", fetchedReels);
      // console.log("ReelsViewer: Number of fetched reels:", fetchedReels ? fetchedReels.length : 0);
      
      setReels(Array.isArray(fetchedReels) ? fetchedReels : []);
      setIsLoading(false);
    });

    return () => {
      // console.log("ReelsViewer: useEffect for getReels - CLEANUP. Component unmounting or dependencies changed.");
      if (typeof unsubscribe === 'function') {
        // console.log("ReelsViewer: Calling unsubscribe() for getReels listener.");
        unsubscribe();
      } else {
        // console.warn("ReelsViewer: Unsubscribe was not a function for getReels listener. Value:", unsubscribe);
      }
    };
  }, []);

  // --- Navigation Functions ---
  const goToNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPreviousReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      // console.warn("ReelsViewer: Container ref is not available for event listeners.");
      return;
    }
    // console.log("ReelsViewer: useEffect for event listeners - Attaching. CurrentIndex:", currentIndex, "Reels.length:", reels.length);

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) { // Scroll Down
        goToNextReel();
      } else if (e.deltaY < 0) { // Scroll Up
        goToPreviousReel();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        goToNextReel();
      } else if (e.key === 'ArrowUp') {
        goToPreviousReel();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY; // Positive for swipe up (next), negative for swipe down (prev)
      if (deltaY > SWIPE_THRESHOLD) { // Swipe Up
        goToNextReel();
      } else if (deltaY < -SWIPE_THRESHOLD) { // Swipe Down
        goToPreviousReel();
      }
      touchStartY.current = 0;
    };

    container.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      // console.log("ReelsViewer: useEffect for event listeners - CLEANUP. Removing event listeners.");
      if (container) {
        container.removeEventListener('wheel', handleScroll);
        window.removeEventListener('keydown', handleKeyDown);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, reels.length]); // Dependencies include goToNextReel and goToPreviousReel if they are not stable

  // console.log(`ReelsViewer: RENDERING. isLoading: ${isLoading}, Reels count: ${reels.length}, CurrentIndex: ${currentIndex}`);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Loading Reels...</h2>
        </div>
      </div>
    );
  }

  if (!isLoading && reels.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
      className="h-screen w-screen overflow-hidden relative bg-black"
      style={{
        transform: `translateY(-${currentIndex * 100}vh)`,
        transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {reels.map((reel, index) => (
        <div 
          key={reel.id} 
          className="h-screen w-screen flex items-center justify-center shrink-0"
        >
          <ReelCard 
            reel={reel} 
            isActive={index === currentIndex}
          />
        </div>
      ))}
      
      {/* Navigation Indicators (Dots on the right) */}
      <div className="fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-30">
        {reels.map((_, index) => (
          <button // Changed div to button for better accessibility
            key={`dot-${index}`}
            onClick={() => setCurrentIndex(index)} // Click on dot to navigate
            className={`w-1.5 h-6 md:h-8 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentIndex 
                ? 'bg-white scale-110' 
                : 'bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to reel ${index + 1}`}
          />
        ))}
      </div>

      {/* Instructions (Bottom center) */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center z-30 px-4 py-1.5 bg-black/30 rounded-full">
        <p className="text-xs md:text-sm opacity-80">
          Swipe, scroll, or use ↑↓ keys to navigate
        </p>
      </div>

      {/* --- Previous Reel Button --- */}
      {currentIndex > 0 && ( // Shudhu prothom reel chara onno shob reel e dekhabe
        <button
          onClick={goToPreviousReel}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 p-2 md:p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors focus:outline-none backdrop-blur-sm"
          aria-label="Previous reel"
        >
          <ChevronUp size={20} className="md:w-6 md:h-6" />
        </button>
      )}

      {/* --- Next Reel Button --- */}
      {currentIndex < reels.length - 1 && ( // Shudhu shesh reel chara onno shob reel e dekhabe
        <button
          onClick={goToNextReel}
          className="fixed bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 z-40 p-2 md:p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors focus:outline-none backdrop-blur-sm"
          aria-label="Next reel"
        >
          <ChevronDown size={20} className="md:w-6 md:h-6" />
        </button>
      )}
    </div>
  );
};

export default ReelsViewer;
