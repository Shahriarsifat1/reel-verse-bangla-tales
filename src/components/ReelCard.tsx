// @/components/ReelCard.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { Reel } from '@/types/reel';
import { getYouTubeEmbedUrl } from '@/utils/youtube';
import { likeReel, addComment } from '@/services/reelService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const COMPONENT_NAME_CARD = "ReelCard";

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, isActive }) => {
  const [likes, setLikes] = useState(reel.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [iframeLoaded, setIframeLoaded] = useState(false); // Track iframe load status
  const [iframeError, setIframeError] = useState(false);   // Track iframe error status

  // Log props when they change and reset iframe status for new active card
  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME_CARD}] Props Update! Reel ID: ${reel.id}, Title: "${reel.title}", isActive: ${isActive}, Current Likes: ${reel.likes}`, "color: GoldenRod; font-weight: bold;");
    if (isActive) {
      setIframeLoaded(false); // Reset load status when card becomes active
      setIframeError(false);  // Reset error status
    }
  }, [reel, isActive]);

  useEffect(() => {
    setLikes(reel.likes);
    // User-specific like status should be handled here
  }, [reel.likes, reel.id]);

  useEffect(() => {
    if (!isActive) {
      setShowComments(false);
    }
  }, [isActive]);

  const handleLike = async () => { /* ... (tomar ager logic) ... */ };
  const handleComment = async () => { /* ... (tomar ager logic) ... */ };
  const handleShare = () => { /* ... (tomar ager logic) ... */ };

  const getFinalEmbedUrl = useCallback(() => {
    if (!reel.videoId) {
      console.warn(`%c[${COMPONENT_NAME_CARD}] getFinalEmbedUrl: reel.videoId is MISSING for Reel ID: ${reel.id}`, "color: orange;");
      return '';
    }
    const baseUrl = getYouTubeEmbedUrl(reel.videoId);
    if (!baseUrl) {
      console.warn(`%c[${COMPONENT_NAME_CARD}] getFinalEmbedUrl: Could not generate baseUrl for videoId: ${reel.videoId} (Reel ID: ${reel.id})`, "color: orange;");
      return '';
    }
    const params = `autoplay=1&mute=0&playsinline=1&loop=1&playlist=${reel.videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`;
    // enablejsapi=1 might be useful if you want to control player via JS later
    const finalUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params}`;
    console.log(`%c[${COMPONENT_NAME_CARD}] Reel ID: ${reel.id}, isActive: ${isActive}. Generated Embed URL: ${finalUrl}`, "color: skyblue;");
    return finalUrl;
  }, [reel.videoId, reel.id, isActive]); // Dependencies for useCallback

  const currentEmbedUrl = getFinalEmbedUrl(); // Calculate URL once per render

  console.log(`%c[${COMPONENT_NAME_CARD}] RENDERING. Reel ID: ${reel.id}, isActive: ${isActive}. Should render iframe? ${isActive && reel.videoId && currentEmbedUrl}`, "color: SlateBlue;");

  return (
    <div 
        className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center`}
        // style={{ border: isActive ? '2px solid lime' : '2px solid transparent' }} // Debug border for active card
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isActive && reel.videoId && currentEmbedUrl && (
          <>
            {!iframeLoaded && !iframeError && ( // Show loading indicator until iframe loads or errors
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white bg-black/50">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm">Loading Video...</p>
              </div>
            )}
            {iframeError && ( // Show error message if iframe fails to load
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white bg-black/50 p-4">
                    <p className="text-red-500 text-sm text-center">Could not load video.</p>
                    <p className="text-xs text-gray-400 text-center mt-1">Please check the video URL or network.</p>
                 </div>
            )}
            <iframe
              key={`${reel.id}-${currentEmbedUrl}`} // Key change if URL changes for same reel ID (though unlikely here)
              src={currentEmbedUrl}
              title={reel.title || 'YouTube video player'}
              className="w-full h-full max-w-full max-h-full object-contain"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => {
                console.log(`%c[${COMPONENT_NAME_CARD}] >>> IFRAME LOADED SUCCESSFULLY for Reel ID: ${reel.id}, URL: ${currentEmbedUrl}`, "color: green; font-weight: bold;");
                setIframeLoaded(true);
                setIframeError(false);
              }}
              onError={(e) => {
                console.error(`%c[${COMPONENT_NAME_CARD}] >>> IFRAME FAILED TO LOAD for Reel ID: ${reel.id}, URL: ${currentEmbedUrl}`, "color: red; font-weight: bold;", e);
                setIframeError(true);
                setIframeLoaded(false);
              }}
              style={{ visibility: iframeLoaded ? 'visible' : 'hidden' }} // Hide iframe until loaded
            />
          </>
        )}
        {/* Placeholder for inactive or invalid reels */}
        {(!isActive || !reel.videoId || !currentEmbedUrl && isActive) && (
            <div className="w-full h-full bg-black flex items-center justify-center">
                {isActive && !reel.videoId && <p className="text-orange-500">Video ID missing</p>}
                {isActive && reel.videoId && !currentEmbedUrl && <p className="text-orange-500">Could not generate video URL</p>}
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* UI Elements: Video Info, Action Buttons, Comments Modal */}
      {/* Tomar ager UI code ekhane copy-paste korbe */}
      <div className="absolute bottom-24 left-4 right-4 text-white z-10 p-2 rounded-lg bg-black/30 backdrop-blur-sm md:max-w-md md:left-6">
        <h3 className="text-base md:text-lg font-bold mb-1 leading-tight line-clamp-2">{reel.title}</h3>
        {isActive && (
            <div className="flex items-center gap-2 text-xs md:text-sm opacity-90">
            <Play size={14} />
            <span>Now Playing</span>
            </div>
        )}
      </div>
      <div className="absolute bottom-24 right-4 flex flex-col items-center gap-5 z-10">
        <button onClick={handleLike} className={`flex flex-col items-center gap-1 ... ${isLiked ? 'text-red-500' : 'text-white ...'}`} aria-label={isLiked ? "Unlike reel" : "Like reel"} aria-pressed={isLiked}>
            <div className="w-10 h-10 ..."><Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /></div>
            <span>{likes > 0 ? likes : ''}</span>
        </button>
        <button onClick={() => setShowComments(prev => !prev)} className="flex flex-col items-center gap-1 ..." aria-label="View comments">
            <div className="w-10 h-10 ..."><MessageCircle size={20} /></div>
            <span>{reel.comments?.length || ''}</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 ..." aria-label="Share reel">
            <div className="w-10 h-10 ..."><Share2 size={20}/></div>
        </button>
      </div>
      {showComments && (
        <div className="absolute inset-0 ..." onClick={() => setShowComments(false)}>
          <div className="w-full max-w-md ..." onClick={(e) => e.stopPropagation()}>
            {/* ... Comments Header, List, Input form ... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelCard;    };
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
