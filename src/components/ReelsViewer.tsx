// @/components/ReelsViewer.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef } from 'react';
import { Reel } from '@/types/reel';
import { getReels } from '@/services/reelService';
import ReelCard from './ReelCard'; // Nishchit koro ei path thik ache

const ReelsViewer: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 50;

  // For dynamic height calculation (optional, use if 100vh causes issues on mobile)
  // const [viewportHeight, setViewportHeight] = useState(0);

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     setViewportHeight(window.innerHeight);
  //     const handleResize = () => {
  //       setViewportHeight(window.innerHeight);
  //     };
  //     window.addEventListener('resize', handleResize);
  //     return () => window.removeEventListener('resize', handleResize);
  //   }
  // }, []);


  useEffect(() => {
    console.log("ReelsViewer: useEffect for getReels - MOUNTING or DEPENDENCIES CHANGED. Setting up listener.");
    const unsubscribe = getReels((fetchedReels) => {
      console.log("ReelsViewer: getReels callback triggered. Fetched Reels Array:", fetchedReels);
      console.log("ReelsViewer: Number of fetched reels:", fetchedReels ? fetchedReels.length : 0);
      
      setReels(Array.isArray(fetchedReels) ? fetchedReels : []);
      setIsLoading(false);
    });

    return () => {
      console.log("ReelsViewer: useEffect for getReels - CLEANUP. Component unmounting or dependencies changed.");
      if (typeof unsubscribe === 'function') {
        console.log("ReelsViewer: Calling unsubscribe() for getReels listener.");
        unsubscribe();
      } else {
        console.warn("ReelsViewer: Unsubscribe was not a function for getReels listener. Value:", unsubscribe);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.warn("ReelsViewer: Container ref is not available for event listeners.");
      return;
    }
    console.log("ReelsViewer: useEffect for event listeners - Attaching. CurrentIndex:", currentIndex, "Reels.length:", reels.length);

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0 && currentIndex < reels.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
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

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      if (deltaY > SWIPE_THRESHOLD && currentIndex < reels.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (deltaY < -SWIPE_THRESHOLD && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
      touchStartY.current = 0;
    };

    container.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      console.log("ReelsViewer: useEffect for event listeners - CLEANUP. Removing event listeners.");
      if (container) {
        container.removeEventListener('wheel', handleScroll);
        window.removeEventListener('keydown', handleKeyDown);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, reels.length]);

  console.log(`ReelsViewer: RENDERING. isLoading: ${isLoading}, Reels count: ${reels.length}, CurrentIndex: ${currentIndex}`);
  // if (viewportHeight > 0) { // For dynamic height debugging
  //   console.log(`ReelsViewer: ViewportHeight: ${viewportHeight}px, TranslateY: -${currentIndex * viewportHeight}px`);
  // }


  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Added w-screen to ensure full width for loading screen */}
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
        {/* Added w-screen here too */}
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
      // --- CSS Class Updates ---
      className="h-screen w-screen overflow-hidden relative bg-black" 
      // Ensure w-screen (width: 100vw) is also set for the main container
      style={{
        // Using 100vh for height. If mobile vh is an issue, dynamic height (viewportHeight in px) is an alternative.
        // transform: `translateY(-${currentIndex * (viewportHeight > 0 ? viewportHeight : window.innerHeight)}px)`, // Example with dynamic height in pixels
        transform: `translateY(-${currentIndex * 100}vh)`, // Original vh based transform
        transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {reels.map((reel, index) => (
        <div 
          key={reel.id} 
          // --- CSS Class Updates for each reel item ---
          className="h-screen w-screen flex items-center justify-center shrink-0"
          // Ensure each reel item also takes full viewport width and height
          // shrink-0 is important if the parent is a flex container and items might shrink
          // style={viewportHeight > 0 ? { height: `${viewportHeight}px`, width: '100vw' } : {}} // For dynamic height
        >
          <ReelCard 
            reel={reel} 
            isActive={index === currentIndex}
          />
        </div>
      ))}
      
      {/* Navigation indicators and Instructions remain the same */}
      <div className="fixed right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-50">
        {reels.map((_, index) => (
          <div
            key={`dot-${index}`}
            className={`w-1 h-8 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center z-40">
        <p className="text-sm opacity-75">
          Swipe, scroll, or use ↑↓ keys to navigate
        </p>
      </div>
    </div>
  );
};

export default ReelsViewer;
