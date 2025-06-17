// @/components/ReelsViewer.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Reel } from '@/types/reel';
import { getReels } from '@/services/reelService';
import ReelCard from './ReelCard';
import { ChevronUp, ChevronDown } from 'lucide-react';

const COMPONENT_NAME = "ReelsViewer";

const ReelsViewer: React.FC = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const SWIPE_THRESHOLD = 50;
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME}] MOUNTED. Initial setup.`, "color: blue; font-weight: bold;");
    let isMounted = true;

    const calculateAndSetHeight = () => {
      if (typeof window !== 'undefined') {
        const currentVh = window.innerHeight;
        // console.log(`%c[${COMPONENT_NAME}] calculateAndSetHeight: window.innerHeight is ${currentVh}px`, "color: orange;");
        if (isMounted) setViewportHeight(currentVh);
      }
    };
    calculateAndSetHeight();
    window.addEventListener('resize', calculateAndSetHeight);
    window.addEventListener('orientationchange', calculateAndSetHeight);
    
    // console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: Setting up Firebase listener.`, "color: green;");
    const unsubscribe = getReels((fetchedReels) => {
      if (!isMounted) { /* ... */ return; }
      // console.groupCollapsed(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: getReels callback!`, "color: green;");
      // console.log("Fetched Reels Array:", fetchedReels);
      // console.groupEnd();
      setReels(Array.isArray(fetchedReels) ? fetchedReels : []);
      setIsLoading(false);
      // console.log(`%c[${COMPONENT_NAME}] useEffect[dataFetch]: State updated. isLoading: false, reels.length: ${Array.isArray(fetchedReels) ? fetchedReels.length : 0}`, "color: green; font-weight:bold;");
    });

    return () => {
      console.log(`%c[${COMPONENT_NAME}] UNMOUNTING. Cleanup.`, "color: red; font-weight: bold;");
      isMounted = false;
      window.removeEventListener('resize', calculateAndSetHeight);
      window.removeEventListener('orientationchange', calculateAndSetHeight);
      if (typeof unsubscribe === 'function') { /* ... */ unsubscribe(); } 
      // else { /* ... */ }
    };
  }, []);

  const reelsRef = useRef(reels);
  const currentIndexRef = useRef(currentIndex);
  useEffect(() => { reelsRef.current = reels; currentIndexRef.current = currentIndex; }, [reels, currentIndex]);

  const goToNextReel = useCallback(() => {
    if (currentIndexRef.current < reelsRef.current.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, []); 

  const goToPreviousReel = useCallback(() => {
    if (currentIndexRef.current > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, []); 

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer || viewportHeight === 0) { // Wait for container and viewportHeight
      // console.warn(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: Container or viewportHeight NOT ready. Listeners not attached.`, "color: orange;");
      return;
    }
    // console.log(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: ATTACHING event listeners. CurrentIndex: ${currentIndex}, Reels.length: ${reels.length}`, "color: dodgerblue;");

    const handleScroll = (e: WheelEvent) => { e.preventDefault(); if (e.deltaY > 0) { goToNextReel(); } else if (e.deltaY < 0) { goToPreviousReel(); }};
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'ArrowDown') { goToNextReel(); } else if (e.key === 'ArrowUp') { goToPreviousReel(); }};
    const handleTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); };
    const handleTouchEnd = (e: TouchEvent) => { 
        if (touchStartY.current === 0) return;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;
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
      // console.log(`%c[${COMPONENT_NAME}] useEffect[eventListeners]: CLEANUP. Removing event listeners.`, "color: #dc3545;");
      if (currentContainer) { /* ... remove listeners ... */ }
    };
  }, [currentIndex, reels.length, goToNextReel, goToPreviousReel, viewportHeight]); // Added viewportHeight

  // useEffect(() => { console.log(`%c[${COMPONENT_NAME}] StateChange: currentIndex is now ${currentIndex}`, "color: purple; font-weight:bold;"); }, [currentIndex]);
  // useEffect(() => { console.log(`%c[${COMPONENT_NAME}] StateChange: reels.length is now ${reels.length}`, "color: purple; font-weight:bold;"); }, [reels]);

  const transformStyleValue = viewportHeight > 0 && reels.length > 0
    ? `translateY(-${currentIndex * viewportHeight}px)`
    : 'translateY(0px)';

  // console.log(`%c[${COMPONENT_NAME}] === PRE-RENDER LOG ===\nisLoading: ${isLoading}, Reels.length: ${reels.length}, CurrentIndex: ${currentIndex}, ViewportHeight: ${viewportHeight}px, Transform: ${transformStyleValue}`, "color: magenta; font-weight: bold;");

  if (isLoading || (viewportHeight === 0 && reels.length > 0)) { // Show loading if viewportHeight not set yet but reels are there
    // console.log(`%c[${COMPONENT_NAME}] Rendering: LOADING UI (isLoading: ${isLoading}, viewportHeight: ${viewportHeight})`, "color: gray;");
    return ( 
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isLoading && reels.length === 0) {
    // console.log(`%c[${COMPONENT_NAME}] Rendering: NO REELS UI`, "color: gray;");
    return ( /* ... No Reels UI ... */ );
  }

  return (
    <div 
      ref={containerRef}
      className="w-screen overflow-hidden relative bg-black" // height will be set by style
      style={{
        height: `${viewportHeight}px`, 
        width: '100vw',
        transform: transformStyleValue,
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {reels.map((reel, index) => (
        <div 
          key={reel.id} 
          className="w-screen flex items-center justify-center shrink-0"
          style={{ height: `${viewportHeight}px` }}
        >
          {/* {console.log(`%c[${COMPONENT_NAME}] Mapping reel for render: ID=${reel.id}, Index=${index}, isActive=${index === currentIndex}, VP Height: ${viewportHeight}px`, "color: sienna;")} */}
          <ReelCard 
            reel={reel} 
            isActive={index === currentIndex}
          />
        </div>
      ))}
      
      {/* Navigation UI elements (Dots, Instructions, Prev/Next Buttons) */}
      {/* Tomar ager UI code ekhane copy-paste korbe */}
      <div className="fixed right-2 md:right-4 top-1/2 ...">{/* ... dots ... */}</div>
      <div className="fixed bottom-4 left-1/2 ...">{/* ... instructions ... */}</div>
      {currentIndex > 0 && (<button onClick={goToPreviousReel} className="fixed top-4 ..."><ChevronUp size={20}/></button>)}
      {currentIndex < reels.length - 1 && (<button onClick={goToNextReel} className="fixed bottom-16 ..."><ChevronDown size={20}/></button>)}
    </div>
  );
};

export default ReelsViewer;
