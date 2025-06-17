// @/components/ReelCard.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { Reel } from '@/types/reel';
import { getYouTubeEmbedUrl } from '@/utils/youtube';
import { likeReel, addComment } from '@/services/reelService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const COMPONENT_NAME_CARD = "ReelCard"; // Logging er jonno

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, isActive }) => {
  const [likes, setLikes] = useState(reel.likes);
  const [isLiked, setIsLiked] = useState(false); // Consider fetching user-specific liked state
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null); // Ref for iframe

  // Log props when they change
  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME_CARD}] Props updated. Reel ID: ${reel.id}, Title: "${reel.title}", isActive: ${isActive}`, "color: GoldenRod;");
  }, [reel, isActive]);

  // Update likes when reel.likes prop changes
  useEffect(() => {
    console.log(`%c[${COMPONENT_NAME_CARD}] Reel likes prop changed to: ${reel.likes} for Reel ID: ${reel.id}. Updating local 'likes' state.`, "color: GoldenRod;");
    setLikes(reel.likes);
    // User-specific like status should be fetched/set here if needed
    // Example: setIsLiked(currentUser.hasLiked(reel.id));
  }, [reel.likes, reel.id]);

  // Reset comment modal when card becomes inactive
  useEffect(() => {
    if (!isActive) {
      setShowComments(false);
    }
  }, [isActive]);


  const handleLike = async () => {
    // ... (tomar ager handleLike logic thik chilo, shudhu console log add kora jete pare)
    console.log(`%c[${COMPONENT_NAME_CARD}] handleLike called. Reel ID: ${reel.id}, Current isLiked: ${isLiked}`, "color: LightSeaGreen;");
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikes(prevLikes => newLikedState ? prevLikes + 1 : (prevLikes > 0 ? prevLikes - 1 : 0));

    try {
      if (newLikedState) {
        await likeReel(reel.id); // Assuming likeReel in service handles backend update
        toast({ title: "Liked! ❤️" });
      } else {
        // await unlikeReel(reel.id); // If you have an unlike service
        toast({ title: "Unliked" });
      }
    } catch (error) {
      console.error(`%c[${COMPONENT_NAME_CARD}] Error updating like for Reel ID: ${reel.id}:`, "color: red;", error);
      setIsLiked(!newLikedState); // Revert UI
      setLikes(prevLikes => newLikedState ? (prevLikes > 0 ? prevLikes - 1 : 0) : prevLikes + 1); // Revert UI
      toast({ title: "Error liking reel", variant: "destructive" });
    }
  };

  const handleComment = async () => {
    // ... (tomar ager handleComment logic thik chilo, shudhu console log add kora jete pare)
    if (!commentText.trim()) return;
    console.log(`%c[${COMPONENT_NAME_CARD}] handleComment called. Reel ID: ${reel.id}, Text: "${commentText}"`, "color: LightSeaGreen;");
    
    const commentPayload = { text: commentText, author: 'Anonymous User' }; // User info can be dynamic

    try {
      await addComment(reel.id, commentPayload);
      setCommentText('');
      toast({ title: "Comment added! 💬" });
    } catch (error) {
      console.error(`%c[${COMPONENT_NAME_CARD}] Error adding comment for Reel ID: ${reel.id}:`, "color: red;", error);
      toast({ title: "Error posting comment", variant: "destructive" });
    }
  };

  const handleShare = () => { /* ... (tomar ager handleShare logic thik chilo) ... */ };

  const getFinalEmbedUrl = () => {
    if (!reel.videoId) {
      console.warn(`%c[${COMPONENT_NAME_CARD}] getFinalEmbedUrl: reel.videoId is missing for Reel ID: ${reel.id}`, "color: orange;");
      return '';
    }
    const baseUrl = getYouTubeEmbedUrl(reel.videoId);
    if (!baseUrl) {
      console.warn(`%c[${COMPONENT_NAME_CARD}] getFinalEmbedUrl: Could not generate baseUrl for videoId: ${reel.videoId}`, "color: orange;");
      return '';
    }
    // Added origin parameter for security if your app has a domain
    // const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = `autoplay=1&mute=0&playsinline=1&loop=1&playlist=${reel.videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
    // controls=0, showinfo=0, rel=0, iv_load_policy=3, modestbranding=1 -> YouTube player UI komiye dey
    // origin=${encodeURIComponent(origin)} 
    
    const finalUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params}`;
    // console.log(`%c[${COMPONENT_NAME_CARD}] Final Embed URL for Reel ID ${reel.id}: ${finalUrl}`, "color: skyblue;");
    return finalUrl;
  };

  // Log when iframe is about to be rendered or not
  // console.log(`%c[${COMPONENT_NAME_CARD}] RENDERING. Reel ID: ${reel.id}, isActive: ${isActive}. Should render iframe? ${isActive && reel.videoId}`, "color: SlateBlue;");

  return (
    <div 
        className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-100'}`}
        // Added opacity transition for smoother active/inactive state change (optional)
        // style={{ transition: 'opacity 0.3s ease-in-out' }} 
    >
      {/* Debugging: Visual indicator for active card's bounds */}
      {/* {isActive && <div className="absolute inset-0 border-4 border-lime-500 pointer-events-none z-50"></div>} */}

      <div className="absolute inset-0 flex items-center justify-center">
        {isActive && reel.videoId && (
          <iframe
            ref={iframeRef}
            key={`${reel.id}-${isActive}`} // Key change on isActive might force iframe reload if needed
            src={getFinalEmbedUrl()}
            title={reel.title || 'YouTube video player'}
            className="w-full h-full max-w-full max-h-full object-contain"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => console.log(`%c[${COMPONENT_NAME_CARD}] iframe LOADED for Reel ID: ${reel.id}`, "color: green;")}
            onError={() => console.error(`%c[${COMPONENT_NAME_CARD}] iframe FAILED TO LOAD for Reel ID: ${reel.id}`, "color: red;")}
          />
        )}
        {/* Placeholder for inactive reels - This ensures the space is occupied consistently */}
        {/* If this causes issues, it can be removed, but ReelViewer's div should maintain height */}
        {!isActive && (
            <div className="w-full h-full bg-black flex items-center justify-center">
                {/* Optional: Show a placeholder or spinner for inactive cards if they are preloaded but hidden */}
                {/* <p className="text-gray-700">Loading reel...</p> */}
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* UI Elements: Video Info, Action Buttons, Comments Modal */}
      {/* ... (tomar ager UI elements ekhane thik chilo) ... */}
      {/* Nicher UI element gulo copy-paste kora hocche tomar ager code theke */}
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
        <button /* ... Like button ... */ onClick={handleLike} className={`... ${isLiked ? 'text-red-500' : 'text-white ...'}`}>
            <div className="..."><Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /></div>
            <span>{likes > 0 ? likes : ''}</span>
        </button>
        <button /* ... Comment button ... */ onClick={() => setShowComments(prev => !prev)} className="...">
            <div className="..."><MessageCircle size={20} /></div>
            <span>{reel.comments?.length || ''}</span>
        </button>
        <button /* ... Share button ... */ onClick={handleShare} className="...">
            <div className="..."><Share2 size={20}/></div>
        </button>
      </div>

      {showComments && (
        <div /* ... Comments Modal ... */ onClick={() => setShowComments(false)}>
          <div /* ... Modal Content ... */ onClick={(e) => e.stopPropagation()}>
            {/* ... Comments Header, List, Input ... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelCard;
