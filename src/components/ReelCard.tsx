
import React, { useState } from 'react';
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
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(isActive);

  const handleLike = async () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes(prev => prev + 1);
      try {
        await likeReel(reel.id, likes);
        toast({
          title: "Liked! ❤️",
          description: "You liked this reel",
        });
      } catch (error) {
        console.error('Error liking reel:', error);
        setIsLiked(false);
        setLikes(prev => prev - 1);
      }
    }
  };

  const handleComment = async () => {
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        author: 'Anonymous',
        createdAt: Date.now()
      };
      
      try {
        await addComment(reel.id, newComment);
        setCommentText('');
        toast({
          title: "Comment added! 💬",
          description: "Your comment has been posted",
        });
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reel.title,
        url: reel.youtubeUrl
      });
    } else {
      navigator.clipboard.writeText(reel.youtubeUrl);
      toast({
        title: "Link copied! 🔗",
        description: "Video link copied to clipboard",
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video Player */}
      <div className="absolute inset-0">
        {isActive && (
          <iframe
            src={getYouTubeEmbedUrl(reel.videoId)}
            className="w-full h-full object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        
        {/* Video overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Video Info */}
      <div className="absolute bottom-20 left-4 right-20 text-white">
        <h3 className="text-lg font-bold mb-2 leading-tight">{reel.title}</h3>
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Play size={16} />
          <span>Now Playing</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6">
        <button
          onClick={handleLike}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            isLiked ? 'text-red-500 scale-110' : 'text-white hover:text-red-400'
          }`}
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
        >
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <MessageCircle size={24} />
          </div>
          <span className="text-xs font-medium">{reel.comments?.length || 0}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white hover:text-green-400 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Share2 size={24} />
          </div>
          <span className="text-xs font-medium">Share</span>
        </button>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Comments</h4>
              <Button
                variant="ghost"
                onClick={() => setShowComments(false)}
                className="text-gray-500"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-3 mb-4">
              {reel.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {comment.author[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{comment.author}</p>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleComment} className="bg-gradient-to-r from-purple-500 to-pink-500">
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
