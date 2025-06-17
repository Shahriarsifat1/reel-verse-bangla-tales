import React, { useState, useEffect } from 'react'; // Added useEffect
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { Reel } from '@/types/reel';
import { getYouTubeEmbedUrl } from '@/utils/youtube';
import { likeReel, addComment } from '@/services/reelService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, isActive }) => {
  const [likes, setLikes] = useState(reel.likes);
  const [isLiked, setIsLiked] = useState(false); // Consider fetching initial liked state if available
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  // const [isPlaying, setIsPlaying] = useState(isActive); // This state wasn't directly controlling the iframe's playback.
                                                        // YouTube iframe autoplay is controlled by URL params.
                                                        // Kept for now as per original code, but note its limited current use.
  // To make isPlaying reflect isActive, you might use:
  // useEffect(() => {
  //   setIsPlaying(isActive);
  // }, [isActive]);
  // However, isPlaying is not currently used to control the iframe.

  // If you need to sync isLiked with backend data or persistence:
  // useEffect(() => {
  //   // Check if the current user has liked this reel initially
  //   // e.g., const userHasLiked = checkUserLikeStatus(reel.id, userId);
  //   // setIsLiked(userHasLiked);
  // }, [reel.id]);


  const handleLike = async () => {
    // Basic toggle logic for like state for immediate UI feedback
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      // Here you'd typically send the actual like/unlike action to the backend
      // For now, `likeReel` seems to only increment. A more robust backend would handle toggle.
      // Assuming likeReel should be called only on actual like, not unlike.
      if (newLikedState) {
        await likeReel(reel.id, likes + 1); // Send updated like count or just signal a like action
        toast({
          title: "Liked! ❤️",
          description: "You liked this reel",
        });
      } else {
        // Optionally, call an unlikeReel service here
        // await unlikeReel(reel.id, likes - 1);
        toast({
          title: "Unliked",
          description: "You unliked this reel",
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert UI changes on error
      setIsLiked(!newLikedState);
      setLikes(prev => newLikedState ? prev - 1 : prev + 1);
      toast({
        title: "Error",
        description: "Could not update like status.",
        variant: "destructive"
      });
    }
  };

  const handleComment = async () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(), // Consider a more robust ID generation (e.g., UUID)
        text: commentText,
        author: 'Anonymous', // Replace with actual user info if available
        createdAt: Date.now()
      };
      
      try {
        await addComment(reel.id, newComment);
        // Optimistically update comments in UI or refetch if `reel.comments` isn't automatically updated
        // For simplicity, we assume reel.comments might be updated by a parent or a subscription
        setCommentText('');
        toast({
          title: "Comment added! 💬",
          description: "Your comment has been posted",
        });
        // Potentially, you'd want to refresh the comments list here or add to it locally
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
    const shareUrl = reel.youtubeUrl || getYouTubeEmbedUrl(reel.videoId); // Fallback if youtubeUrl isn't direct play link
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

  // Construct the YouTube embed URL with autoplay and unmute parameters
  const getFinalEmbedUrl = () => {
    const baseUrl = getYouTubeEmbedUrl(reel.videoId);
    // Parameters to attempt autoplay with sound. mute=0 means unmuted.
    const params = 'autoplay=1&mute=0'; 
    
    if (baseUrl.includes('?')) {
      return `${baseUrl}&${params}`;
    }
    return `${baseUrl}?${params}`;
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video Player */}
      <div className="absolute inset-0">
        {isActive && (
          <iframe
            key={reel.videoId} // Ensures iframe re-renders if videoId changes while active
            // src={getYouTubeEmbedUrl(reel.videoId)} // Original
            src={getFinalEmbedUrl()} // Updated src for autoplay with sound
            title={reel.title || 'YouTube video player'} // Accessibility: provide a title
            className="w-full h-full" // Removed object-cover as it might not apply well to iframes directly
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            // Consider adding sandbox attribute for enhanced security if needed,
            // e.g., sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            // "allow-scripts" and "allow-same-origin" are important if you want to use YouTube Player API later.
          />
        )}
        
        {/* Video overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Video Info */}
      <div className="absolute bottom-20 left-4 right-20 text-white z-10">
        <h3 className="text-lg font-bold mb-2 leading-tight">{reel.title}</h3>
        {isActive && ( // Show "Now Playing" only for the active reel
            <div className="flex items-center gap-2 text-sm opacity-80">
            <Play size={16} />
            <span>Now Playing</span>
            </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-10">
        <button
          onClick={handleLike}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            isLiked ? 'text-red-500 scale-110' : 'text-white hover:text-red-400'
          }`}
          aria-pressed={isLiked}
          aria-label={isLiked ? "Unlike reel" : "Like reel"}
        >
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Heart 
              size={24} 
              fill={isLiked ? 'currentColor' : 'none'} 
              className={isLiked ? 'animate-pulse' : ''}
            />
          </div>
          <span className="text-xs font-medium">{likes}</span>
        </button>

        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors"
          aria-label="View comments"
        >
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <MessageCircle size={24} />
          </div>
          <span className="text-xs font-medium">{reel.comments?.length || 0}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white hover:text-green-400 transition-colors"
          aria-label="Share reel"
        >
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Share2 size={24} />
          </div>
          <span className="text-xs font-medium">Share</span>
        </button>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-end z-20">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[60vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h4 className="text-lg font-bold text-gray-800">Comments</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(false)}
                className="text-gray-500 hover:bg-gray-200"
                aria-label="Close comments"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3 mb-4 overflow-y-auto flex-grow">
              {reel.comments && reel.comments.length > 0 ? (
                reel.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {comment.author?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{comment.author || 'Anonymous'}</p>
                      <p className="text-gray-700 text-sm">{comment.text}</p>
                      {/* Optional: Add timestamp for comment */}
                      {/* <p className="text-xs text-gray-500 mt-0.5">{new Date(comment.createdAt).toLocaleTimeString()}</p> */}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-gray-200 flex-shrink-0">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                className="flex-1"
              />
              <Button onClick={handleComment} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
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
