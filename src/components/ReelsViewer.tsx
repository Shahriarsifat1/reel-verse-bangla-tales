// @/components/ReelsViewer.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef, useCallback } from 'react'; // useCallback add kora holo
import { Reel } from '@/types/reel';
import { getReels } from '@/services/reelService';
import ReelCard from './ReelCard'; // Nishchit koro ei path thik ache
import { ChevronUp, ChevronDown } from 'lucide-react'; // Button icon er jonno

const COMPONENT_NAME = "ReelsViewer";

const ReelsViewer: React.FC = () => {
  // Initializing log shudhu useEffect e rakha hobe mount check korar jonno

  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 50;
  const [viewportHeight, setViewportHeight] = useState(0); // Initialize with 0

  // --- Effect for Initial Setup and Viewport Height ---
  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME}] MOUNTED. Initial setup effect running.`, "color: blue; font-weight: bold;");

    const calculateAndSetHeight = () => {
      if (typeof window !== 'undefined') {
        const currentVh = window.innerHeight;
        console.log(`%c[${COMPONENT_NAME}] calculateAndSetHeight: window.innerHeight is ${currentVh}px`, "color: orange;");
        setViewportHeight(currentVh);
      }
    };

    calculateAndSetHeight(); // Calculate on mount

    window.addEventListener('resize', calculateAndSetHeight);
    window.addEventListener('orientationchange', calculateAndSetHeight);
    
    // Data fetching part
    console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Setting up Firebase listener.`, "color: green;");
    let isMounted = true;
    const unsubscribe = getReels((fetchedReels) => {
      if (!isMounted) {
        console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Received data AFTER component unmounted. IGNORED.`, "color: red;");
        return;
      }
      console.groupCollapsed(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: getReels callback!`, "color: green;");
      console.log("Fetched Reels Array:", fetchedReels);
      console.log("Number of fetched reels:", fetchedReels ? fetchedReels.length : 0);
      console.groupEnd();
      
      setReels(Array.isArray(fetchedReels) ? fetchedReels : []);
      setIsLoading(false);
      console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: State updated. isLoading: false, reels.length: ${Array.isArray(fetchedReels) ? fetchedReels.length : 0}`, "color: green; font-weight:bold;");
    });

    return () => {
      console.log(`%c[${COMPONENT_NAME}] UNMOUNTING. Cleanup for initial setup and dataFetch effect.`, "color: red; font-weight: bold;");
      isMounted = false;
      window.removeEventListener('resize', calculateAndSetHeight);
      window.removeEventListener('orientationchange', calculateAndSetHeight);
      if (typeof unsubscribe === 'function') {
        console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Calling unsubscribe() for Firebase.`, "color: red;");
        unsubscribe();
      } else {
        console.warn(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Unsubscribe was NOT a function. Value:`, "color: orange;", unsubscribe);
      }
    };
  }, []); // Empty dependency array: runs only on mount and unmount


  // --- Navigation Functions (using useCallback for stability if passed as deps) ---
  const goToNextReel = useCallback(() => {
    console.log(`%c[${COMPONENT_NAME}] goToNextReel called. CurrentIndex: ${currentIndexRef.current}, Reels.length: ${reelsRef.current.length}`, "color: #007bff;");
    if (currentIndexRef.current < reelsRef.current.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      console.log(`%c[${COMPONENT_NAME}] goToNextReel: Already at the last reel.`, "color: #007bff;");
    }
  }, []); // Empty deps because we use refs for currentIndex and reels.length inside, or pass them as deps

  const goToPreviousReel = useCallback(() => {
    console.log(`%c[${COMPONENT_NAME}] goToPreviousReel called. CurrentIndex: ${currentIndexRef.current}`, "color: #007bff;");
    if (currentIndexRef.current > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      console.log(`%c[${COMPONENT_NAME}] goToPreviousReel: Already at the first reel.`, "color: #007bff;");
    }
  }, []); // Same as above

  // Refs for stable access in callbacks if needed, to avoid re-creating navigation functions too often
  const reelsRef = useRef(reels);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    reelsRef.current = reels;
    currentIndexRef.current = currentIndex;
  }, [reels, currentIndex]);


  // --- Effect for Event Listeners ---
  useEffect(() => {
    const currentContainer = containerRef.current; // Capture current value for cleanup
    if (!currentContainer) {
      console.warn(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: Container ref NOT available. Listeners not attached. CurrentIndex: ${currentIndex}, Reels.length: ${reels.length}`, "color: orange;");
      return;
    }
    console.log(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: ATTACHING event listeners. CurrentIndex: ${currentIndex}, Reels.length: ${reels.length}`, "color: dodgerblue;");

    const handleScroll = (e: WheelEvent) => { 
        e.preventDefault();
        console.log(`%c[${COMPONENT_NAME}] Event: Wheel scroll. deltaY: ${e.deltaY}`, "color: #6c757d;");
        if (e.deltaY > 0) { goToNextReel(); } 
        else if (e.deltaY < 0) { goToPreviousReel(); }
    };
    const handleKeyDown = (e: KeyboardEvent) => { 
        console.log(`%c[${COMPONENT_NAME}] Event: KeyDown. key: ${e.key}`, "color: #6c757d;");
        if (e.key === 'ArrowDown') { goToNextReel(); } 
        else if (e.key === 'ArrowUp') { goToPreviousReel(); }
    };
    const handleTouchStart = (e: TouchEvent) => { 
        touchStartY.current = e.touches[0].clientY;
        console.log(`%c[${COMPONENT_NAME}] Event: TouchStart. startY: ${touchStartY.current}`, "color: #6c757d;");
    };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); };
    const handleTouchEnd = (e: TouchEvent) => { 
        if (touchStartY.current === 0) return;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;
        console.log(`%c[${COMPONENT_NAME}] Event: TouchEnd. deltaY: ${deltaY}`, "color: #6c757d;");
        if (deltaY > SWIPE_THRESHOLD) { goToNextReel(); } 
        else if (deltaY < -SWIPE_THRESHOLD) { goToPreviousReel(); }
        touchStartY.current = 0;
    };

    currentContainer.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    currentContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    currentContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    currentContainer.addEventListener('touchend', handleTouchEnd);

    return () => {
      console.log(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: CLEANUP. CurrentIndex: ${currentIndex}, Reels.length: ${reels.length}. Removing event listeners.`, "color: #dc3545;");
      if (currentContainer) {
        currentContainer.removeEventListener('wheel', handleScroll);
        window.removeEventListener('keydown', handleKeyDown);
        currentContainer.removeEventListener('touchstart', handleTouchStart);
        currentContainer.removeEventListener('touchmove', handleTouchMove);
        currentContainer.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentIndex, reels.length, goToNextReel, goToPreviousReel]); // Added navigation functions to deps as they are used

  // Log state changes
  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME}] StateChange: currentIndex is now ${currentIndex}`, "color: purple; font-weight:bold;");
  }, [currentIndex]);

  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME}] StateChange: reels.length is now ${reels.length}`, "color: purple; font-weight:bold;");
    if (reels.length > 0 && currentIndex >= reels.length) {
        console.warn(`%c[${COMPONENT_NAME}] currentIndex (${currentIndex}) is out of bounds for reels.length (${reels.length}). Resetting to last reel.`, "color: orange;");
        setCurrentIndex(reels.length - 1);
    }
  }, [reels, currentIndex]); // Added currentIndex here to check bounds when reels change


  const transformStyleValue = viewportHeight > 0 && reels.length > 0
    ? `translateY(-${currentIndex * viewportHeight}px)`
    : (reels.length > 0 ? `translateY(-${currentIndex * 100}vh)` : 'translateY(0px)'); // Prevent NaN if viewportHeight is 0 initially

  console.log(`%c[${COMPONENT_NAME}] === PRE-RENDER LOG ===\nisLoading: ${isLoading}, Reels.length: ${reels.length}, CurrentIndex: ${currentIndex}, ViewportHeight: ${viewportHeight}px, Transform: ${transformStyleValue}`, "color: magenta; font-weight: bold; padding: 2px; border: 1px solid magenta;");

  if (isLoading) {
    console.log(`%c[${COMPONENT_NAME}] Rendering: LOADING UI`, "color: gray;");
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
    console.log(`%c[${COMPONENT_NAME}] Rendering: NO REELS UI`, "color: gray;");
    return ( 
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Reels Available</h2>
          <p className="text-lg opacity-75">Ask admin to add some reels!</p>
        </div>
      </div>
    );
  }

  // Only render if viewportHeight is calculated to prevent initial jump/miscalculation
  if (viewportHeight === 0 && reels.length > 0) {
      console.log(`%c[${COMPONENT_NAME}] Rendering: WAITING FOR VIEWPORT HEIGHT. VP Height: ${viewportHeight}px`, "color: orange;");
      return ( // Can be a minimal loading or null
          <div className="h-screen w-screen flex items-center justify-center bg-black">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative bg-black"
      style={{
        height: `${viewportHeight}px`, // Explicit height based on calculated viewport
        width: '100vw',
        transform: transformStyleValue,
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Slightly faster transition
      }}
    >
      {reels.map((reel, index) => (
        <div 
          key={reel.id} 
          className="w-screen flex items-center justify-center shrink-0" // w-screen is enough, height comes from parent
          style={{ height: `${viewportHeight}px` }} // Each reel item gets explicit viewport height
        >
          {console.log(`%c[${COMPONENT_NAME}] Mapping reel for render: ID=${reel.id}, Index=${index}, isActive=${index === currentIndex}, VP Height: ${viewportHeight}px`, "color: sienna;")}
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
                setCurrentIndex(index); // Directly set index here
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
        <button
          onClick={goToPreviousReel}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 p-2 md:p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors focus:outline-none backdrop-blur-sm"
          aria-label="Previous reel"
        >
          <ChevronUp size={20} className="md:w-6 md:h-6" />
        </button>
      )}
      {currentIndex < reels.length - 1 && (
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
