
import { ref, push, get, update, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Reel, Comment } from '@/types/reel';
import { extractYouTubeVideoId } from '@/utils/youtube';

export const addReel = async (title: string, youtubeUrl: string): Promise<string> => {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const reelsRef = ref(database, 'reels');
  const newReel: Omit<Reel, 'id'> = {
    title,
    youtubeUrl,
    videoId,
    likes: 0,
    comments: [],
    createdAt: Date.now()
  };

  const result = await push(reelsRef, newReel);
  return result.key!;
};

export const getReels = (callback: (reels: Reel[]) => void) => {
  const reelsRef = ref(database, 'reels');
  onValue(reelsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const reels: Reel[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(reels.sort((a, b) => b.createdAt - a.createdAt));
    } else {
      callback([]);
    }
  });
};

export const likeReel = async (reelId: string, currentLikes: number) => {
  const reelRef = ref(database, `reels/${reelId}`);
  await update(reelRef, { likes: currentLikes + 1 });
};

export const addComment = async (reelId: string, comment: Comment) => {
  const reelRef = ref(database, `reels/${reelId}`);
  const reelSnapshot = await get(reelRef);
  const reelData = reelSnapshot.val();
  
  const updatedComments = [...(reelData.comments || []), comment];
  await update(reelRef, { comments: updatedComments });
};
