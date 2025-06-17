// @/components/ReelCard.tsx (Tomar project-er path onujayi)

import React, { useState, useEffect, useRef } from 'react'; // useRef add kora holo jodi video element directly control korte hoy
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { Reel } from '@/types/reel';
import { getYouTubeEmbedUrl } from '@/utils/youtube'; // Nishchit koro ei path thik ache
import { likeReel, addComment } from '@/services/reelService'; // Nishchit koro ei path thik ache
import { Button } from '@/components/ui/button'; // Nishchit koro ei path thik ache
import { Input } from '@/components/ui/input'; // Nishchit koro ei path thik ache
import { toast } from '@/hooks/use-toast'; // Nishchit koro ei path thik ache

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, isActive }) => {
  const [likes, setLikes] = useState(reel.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Update likes and isLiked when reel prop changes (e.g., from Firebase update)
  useEffect(() => {
    setLikes(reel.likes);
    // Tomar jodi user-specific like status thake, sheta ekhane set korte paro
    // setIsLiked(checkIfCurrentUserLiked(reel.id)); 
  }, [reel.likes, reel.id]);


  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    // Optimistic UI update for likes count
    setLikes(prevLikes => newLikedState ? prevLikes + 1 : (prevLikes > 0 ? prevLikes - 1 : 0));

    try {
      if (newLikedState) {
        // Assuming your likeReel service handles incrementing likes on the backend
        await likeReel(reel.id); // Shudhu reel.id pathano, service-e logic thakbe
        toast({
          title: "Liked! ❤️",
          description: "You liked this reel",
        });
      } else {
        // Implement unlikeReel service if needed
        // await unlikeReel(reel.id); 
        toast({
          title: "Unliked",
          description: "You unliked this reel",
        });
        // Note: The current likeReel service only increments. 
        // For a full like/unlike, backend logic or a separate unlike service is needed.
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert UI changes on error
      setIsLiked(!newLikedState);
      setLikes(prevLikes => newLikedState ? (prevLikes > 0 ? prevLikes - 1 : 0) : prevLikes + 1);
      toast({
        title: "Error",
        description: "Could not update like status.",
        variant: "destructive"
      });
    }
  };

  const handleComment = async () => {
    if (commentText.trim()) {
      // Shudhu comment text ebong author (jodi thake) pathano
      // ID ebong createdAt server-e (reelService e) generate hobe
      const commentPayload = {
        text: commentText,
        author: 'Anonymous', // Replace with actual user info if available
      };
      
      try {
        await addComment(reel.id, commentPayload);
        setCommentText('');
        toast({
          title: "Comment added! 💬",
          description: "Your comment has been posted",
        });
        // Comments list will update via Firebase real-time listener in ReelsViewer -> getReels
      } catch (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Error",
          description: "Could not post comment.",
          variant: "destructive"
        });
      }
    }
  };

  const handleShare = () => {
    const shareUrl = reel.youtubeUrl || getYouTubeEmbedUrl(reel.videoId);
    if (navigator.share) {
      navigator.share({
        title: reel.title,
        text: `Check out this reel: ${reel.title}`,
        url: shareUrl
      }).catch(error => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied! 🔗",
          description: "Video link copied to clipboard",
        });
      }).catch(err => {
        console.error('Failed to copy link: ', err);
        toast({
          title: "Error",
          description: "Could not copy link.",
          variant: "destructive"
        });
      });
    }
  };

  const getFinalEmbedUrl = () => {
    if (!reel.videoId) return ''; // Handle cases where videoId might be missing
    const baseUrl = getYouTubeEmbedUrl(reel.videoId);
    if (!baseUrl) return ''; // Handle cases where baseUrl might be invalid

    const params = 'autoplay=1&mute=0&playsinline=1&loop=1&playlist=' + reel.videoId; 
    // playsinline=1 iOS e inline play er jonno
    // loop=1&playlist=VIDEO_ID YouTube video loop koranor ekta trick
    
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params}`;
  };

  return (
    // --- CSS Class Updates for ReelCard's main div ---
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {/* Ensures ReelCard takes full height/width of its parent (the h-screen/w-screen div in ReelsViewer) */}
      {/* Added flex utilities to help center content if needed */}

      {/* Video Player */}
      <div className="absolute inset-0 flex items-center justify-center"> {/* Centering iframe */}
        {isActive && reel.videoId && ( // Check if reel.videoId exists
          <iframe
            key={`${reel.id}-${reel.videoId}`} // More unique key if reel.id can be same for different videoId temporarily
            src={getFinalEmbedUrl()}
            title={reel.title || 'YouTube video player'}
            // --- CSS Class Updates for iframe ---
            className="w-full h-full max-w-full max-h-full object-contain"
            // object-contain ensures video maintains aspect ratio within the bounds
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            // sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
            // Consider sandbox for security, but "allow-popups-to-escape-sandbox" might be needed for some YouTube interactions
          />
        )}
        {!isActive && <div className="w-full h-full bg-black" />} {/* Placeholder for inactive reels to maintain structure if needed, or remove */}
        
        {/* Video overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        {/* Adjusted gradient opacity */}
      </div>

      {/* Video Info */}
      <div className="absolute bottom-24 left-4 right-4 text-white z-10 p-2 rounded-lg bg-black/30 backdrop-blur-sm md:max-w-md md:left-6">
        {/* Adjusted positioning and styling for better readability */}
        <h3 className="text-base md:text-lg font-bold mb-1 leading-tight line-clamp-2">{reel.title}</h3>
        {isActive && (
            <div className="flex items-center gap-2 text-xs md:text-sm opacity-90">
            <Play size={14} />
            <span>Now Playing</span>
            </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-24 right-4 flex flex-col items-center gap-5 z-10">
        {/* Adjusted positioning and gap */}
        <button
          onClick={handleLike}
          className={`flex flex-col items-center gap-1 transition-all duration-200 transform hover:scale-110 active:scale-95 ${
            isLiked ? 'text-red-500' : 'text-white hover:text-red-300'
          }`}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike reel" : "Like reel"}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Heart 
              size={20} // md:size={24}
              fill={isLiked ? 'currentColor' : 'none'} 
              className={isLiked ? 'animate-heartbeat' : ''} // Add a custom heartbeat animation if you have one
            />
          </div>
          <span className="text-xs font-medium">{likes > 0 ? likes : ''}</span>
        </button>

        <button
          onClick={() => setShowComments(prev => !prev)} // Toggle comments
          className="flex flex-col items-center gap-1 text-white hover:text-blue-300 transition-colors transform hover:scale-110 active:scale-95"
          aria-label="View comments"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <MessageCircle size={20} />
          </div>
          <span className="text-xs font-medium">{reel.comments?.length || ''}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white hover:text-green-300 transition-colors transform hover:scale-110 active:scale-95"
          aria-label="Share reel"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Share2 size={20}/>
          </div>
          {/* <span className="text-xs font-medium">Share</span> */}
        </button>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-end justify-center z-20"
            onClick={() => setShowComments(false)} // Close on overlay click
        >
          <div 
            className="w-full max-w-md bg-gray-800 text-white rounded-t-2xl p-4 md:p-6 max-h-[70vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h4 className="text-lg font-semibold">Comments ({reel.comments?.length || 0})</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:bg-gray-700 hover:text-white"
                aria-label="Close comments"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3 mb-4 overflow-y-auto flex-grow pr-1"> {/* Added pr-1 for scrollbar */}
              {reel.comments && reel.comments.length > 0 ? (
                reel.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                      {comment.author?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="bg-gray-700 p-2.5 rounded-lg flex-1">
                      <p className="font-medium text-sm text-gray-200">{comment.author || 'Anonymous'}</p>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.text}</p> {/* whitespace-pre-wrap for newlines */}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-6">No comments yet. Be the first to comment!</p>
              )}
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-gray-700 flex-shrink-0">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); }}}
                className="flex-1 bg-gray-700 border-gray-600 placeholder-gray-500 text-white focus:border-purple-500"
              />
              <Button 
                onClick={handleComment} 
                disabled={!commentText.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelCard;
