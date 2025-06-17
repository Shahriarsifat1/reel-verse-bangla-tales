// @/components/ReelsViewer.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef } from 'react';
import { Reel } from '@/types/reel';
import { getReels } from '@/services/reelService';
import ReelCard from './ReelCard'; // Nishchit koro ei path thik ache
import { ChevronUp, ChevronDown } from 'lucide-react'; // Button icon er jonno

const COMPONENT_NAME = "ReelsViewer"; // Logging er jonno component er naam

const ReelsViewer: React.FC = () => {
  console.log(`%c[${COMPONENT_NAME}] Initializing component...`, "color: blue; font-weight: bold;");

  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 50;

  // For dynamic height calculation (optional, use if 100vh causes issues on mobile)
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const calculateHeight = () => {
        console.log(`%c[${COMPONENT_NAME}] Recalculating viewportHeight. window.innerHeight: ${window.innerHeight}px`, "color: orange;");
        setViewportHeight(window.innerHeight);
      };
      calculateHeight(); // Initial calculation
      window.addEventListener('resize', calculateHeight);
      window.addEventListener('orientationchange', calculateHeight); // For mobile orientation changes
      
      return () => {
        console.log(`%c[${COMPONENT_NAME}] Cleanup: Removing resize and orientationchange listeners.`, "color: orange;");
        window.removeEventListener('resize', calculateHeight);
        window.removeEventListener('orientationchange', calculateHeight);
      };
    }
  }, []);


  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: MOUNTING. Setting up Firebase listener.`, "color: green;");
    let isMounted = true; // Track if component is still mounted

    const unsubscribe = getReels((fetchedReels) => {
      if (!isMounted) {
        console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Received data AFTER component unmounted. Ignoring.`, "color: red;");
        return;
      }
      console.groupCollapsed(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: getReels callback triggered.`, "color: green;");
      console.log("Fetched Reels Array:", fetchedReels);
      console.log("Number of fetched reels:", fetchedReels ? fetchedReels.length : 0);
      console.groupEnd();
      
      setReels(Array.isArray(fetchedReels) ? fetchedReels : []);
      setIsLoading(false);
      console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: State updated. isLoading: false, reels.length: ${Array.isArray(fetchedReels) ? fetchedReels.length : 0}`, "color: green;");
    });

    return () => {
      isMounted = false; // Set to false when unmounting
      console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: CLEANUP. Component unmounting.`, "color: red;");
      if (typeof unsubscribe === 'function') {
        console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Calling unsubscribe() for Firebase listener.`, "color: red;");
        unsubscribe();
      } else {
        console.warn(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Unsubscribe was NOT a function. Listener might leak. Value:`, "color: orange;", unsubscribe);
      }
    };
  }, []); // Empty dependency array: runs on mount, cleans up on unmount.


  const handleSetCurrentIndex = (newIndexOrCallback: number | ((prevIndex: number) => number)) => {
    console.log(`%c[${COMPONENT_NAME}] handleSetCurrentIndex: Attempting to set currentIndex. Current: ${currentIndex}, New/Callback:`, "color: purple;", newIndexOrCallback);
    setCurrentIndex(prevIndex => {
        const newIndex = typeof newIndexOrCallback === 'function' ? newIndexOrCallback(prevIndex) : newIndexOrCallback;
        console.log(`%c[${COMPONENT_NAME}] handleSetCurrentIndex: Inside setCurrentIndex. Prev: ${prevIndex}, Calculated New: ${newIndex}`, "color: purple;");
        if (newIndex >= 0 && newIndex < reels.length && newIndex !== prevIndex) {
            console.log(`%c[${COMPONENT_NAME}] handleSetCurrentIndex: Index will change from ${prevIndex} to ${newIndex}.`, "color: purple; font-weight: bold;");
            return newIndex;
        }
        console.log(`%c[${COMPONENT_NAME}] handleSetCurrentIndex: Index change condition not met or no change. New: ${newIndex}, Reels.length: ${reels.length}`, "color: purple;");
        return prevIndex; // No change if conditions not met
    });
  };

  const goToNextReel = () => {
    console.log(`%c[${COMPONENT_NAME}] goToNextReel called. CurrentIndex: ${currentIndex}, Reels.length: ${reels.length}`, "color: #007bff;");
    if (currentIndex < reels.length - 1) {
        handleSetCurrentIndex(prev => prev + 1);
    } else {
        console.log(`%c[${COMPONENT_NAME}] goToNextReel: Already at the last reel.`, "color: #007bff;");
    }
  };

  const goToPreviousReel = () => {
    console.log(`%c[${COMPONENT_NAME}] goToPreviousReel called. CurrentIndex: ${currentIndex}`, "color: #007bff;");
    if (currentIndex > 0) {
        handleSetCurrentIndex(prev => prev - 1);
    } else {
        console.log(`%c[${COMPONENT_NAME}] goToPreviousReel: Already at the first reel.`, "color: #007bff;");
    }
  };


  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.warn(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: Container ref is not available. Listeners not attached.`, "color: orange;");
      return;
    }
    console.log(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: ATTACHING event listeners. CurrentIndex: ${currentIndex}, Reels.length: ${reels.length}`, "color: dodgerblue;");

    const handleScroll = (e: WheelEvent) => { /* ... (same as before, uses goToNext/PreviousReel) ... */ 
        e.preventDefault();
        console.log(`%c[${COMPONENT_NAME}] Event: Wheel scroll. deltaY: ${e.deltaY}`, "color: #6c757d;");
        if (e.deltaY > 0) { goToNextReel(); } 
        else if (e.deltaY < 0) { goToPreviousReel(); }
    };
    const handleKeyDown = (e: KeyboardEvent) => { /* ... (same as before, uses goToNext/PreviousReel) ... */ 
        console.log(`%c[${COMPONENT_NAME}] Event: KeyDown. key: ${e.key}`, "color: #6c757d;");
        if (e.key === 'ArrowDown') { goToNextReel(); } 
        else if (e.key === 'ArrowUp') { goToPreviousReel(); }
    };
    const handleTouchStart = (e: TouchEvent) => { /* ... (same as before) ... */ 
        touchStartY.current = e.touches[0].clientY;
        console.log(`%c[${COMPONENT_NAME}] Event: TouchStart. startY: ${touchStartY.current}`, "color: #6c757d;");
    };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); };
    const handleTouchEnd = (e: TouchEvent) => { /* ... (same as before, uses goToNext/PreviousReel) ... */ 
        if (touchStartY.current === 0) return;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;
        console.log(`%c[${COMPONENT_NAME}] Event: TouchEnd. deltaY: ${deltaY}`, "color: #6c757d;");
        if (deltaY > SWIPE_THRESHOLD) { goToNextReel(); } 
        else if (deltaY < -SWIPE_THRESHOLD) { goToPreviousReel(); }
        touchStartY.current = 0;
    };

    container.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      console.log(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: CLEANUP. Removing event listeners.`, "color: #dc3545;");
      if (container) {
        container.removeEventListener('wheel', handleScroll);
        window.removeEventListener('keydown', handleKeyDown);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, reels.length]); // Dependencies are correct

  console.log(`%c[${COMPONENT_NAME}] RENDERING. isLoading: ${isLoading}, Reels.length: ${reels.length}, CurrentIndex: ${currentIndex}, ViewportHeight: ${viewportHeight}px`, "color: magenta; font-weight: bold;");

  const transformStyle = viewportHeight > 0 
    ? `translateY(-${currentIndex * viewportHeight}px)` 
    : `translateY(-${currentIndex * 100}vh)`; // Fallback to vh if viewportHeight is 0

  if (isLoading) {
    console.log(`%c[${COMPONENT_NAME}] Rendering: LOADING UI`, "color: gray;");
    return ( /* ... Loading UI ... */ 
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Loading Reels...</h2>
        </div>
      </div>
    );
  }

  if (!isLoading && reels.length === 0) {
    console.log(`%c[${COMPONENT_NAME}] Rendering: NO REELS UI`, "color: gray;");
    return ( /* ... No Reels UI ... */ 
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Reels Available</h2>
          <p className="text-lg opacity-75">Ask admin to add some reels!</p>
        </div>
      </div>
    );
  }

  console.log(`%c[${COMPONENT_NAME}] Rendering: REELS LIST. Applying transform: ${transformStyle}`, "color: teal;");
  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative bg-black" // Consistent full screen
      style={{
        transform: transformStyle,
        transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {reels.map((reel, index) => (
        <div 
          key={reel.id} 
          className="h-screen w-screen flex items-center justify-center shrink-0" // Consistent full screen
          style={viewportHeight > 0 ? { height: `${viewportHeight}px`, width: '100vw' } : {}} // Dynamic height for each reel item
        >
          {console.log(`%c[${COMPONENT_NAME}] Mapping reel: ID=${reel.id}, Index=${index}, isActive=${index === currentIndex}`, "color: sienna;")}
          <ReelCard 
            reel={reel} 
            isActive={index === currentIndex}
          />
        </div>
      ))}
      
      {/* Navigation Indicators (Dots) */}
      <div className="fixed right-2 md:right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-30">
        {reels.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => {
                console.log(`%c[${COMPONENT_NAME}] Dot clicked for index: ${index}`, "color: #fd7e14;");
                handleSetCurrentIndex(index);
            }}
            className={`w-1.5 h-6 md:h-8 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentIndex 
                ? 'bg-white scale-110' 
                : 'bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to reel ${index + 1}`}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center z-30 px-4 py-1.5 bg-black/30 rounded-full">
        <p className="text-xs md:text-sm opacity-80">
          Swipe, scroll, or use ↑↓ keys to navigate
        </p>
      </div>

      {/* Previous/Next Buttons */}
      {currentIndex > 0 && (
        <button onClick={goToPreviousReel} className="..." aria-label="Previous reel">
          <ChevronUp size={20} className="md:w-6 md:h-6" />
        </button>
      )}
      {currentIndex < reels.length - 1 && (
        <button onClick={goToNextReel} className="..." aria-label="Next reel">
          <ChevronDown size={20} className="md:w-6 md:h-6" />
        </button>
      )}
    </div>
  );
};

export default ReelsViewer;
