// @/services/reelService.ts  (Tomar project-er path onujayi)

import { ref, push, get, update, onValue, serverTimestamp, runTransaction } from 'firebase/database';
import { database } from '@/lib/firebase'; // Nishchit koro ei path ta thik ache
import { Reel, Comment } from '@/types/reel'; // Nishchit koro ei path ta thik ache
import { extractYouTubeVideoId } from '@/utils/youtube'; // Nishchit koro ei path ta thik ache

export const addReel = async (title: string, youtubeUrl: string): Promise<string> => {
  console.log("reelService (addReel): Attempting to add reel. Title:", title, "URL:", youtubeUrl);
  const videoId = extractYouTubeVideoId(youtubeUrl);
  if (!videoId) {
    console.error("reelService (addReel): Invalid YouTube URL or could not extract video ID from:", youtubeUrl);
    throw new Error('Invalid YouTube URL. Could not extract video ID.');
  }

  const reelsCollectionRef = ref(database, 'reels');
  const newReelRef = push(reelsCollectionRef);
  
  if (!newReelRef.key) {
    console.error("reelService (addReel): Failed to generate a unique key for the new reel.");
    throw new Error('Failed to generate a unique key for the new reel.');
  }

  const newReelData: Reel = {
    id: newReelRef.key,
    title,
    youtubeUrl,
    videoId,
    likes: 0,
    comments: [],
    createdAt: serverTimestamp()
  };

  try {
    await update(ref(database), { [`reels/${newReelRef.key}`]: newReelData });
    console.log("reelService (addReel): Reel added successfully with ID:", newReelRef.key);
    return newReelRef.key;
  } catch (error) {
    console.error("reelService (addReel): Error adding reel to Firebase:", error);
    throw error;
  }
};

export const getReels = (callback: (reels: Reel[]) => void): (() => void) => {
  console.log("reelService (getReels): Setting up Firebase onValue listener for 'reels' path.");
  const reelsQueryRef = ref(database, 'reels');

  const unsubscribe = onValue(reelsQueryRef, (snapshot) => {
    console.log("reelService (getReels): Firebase onValue listener triggered.");
    const data = snapshot.val();
    console.log("reelService (getReels): Raw data from Firebase snapshot:", data);

    const fetchedReels: Reel[] = [];
    if (data) {
      for (const key in data) {
        // Ensure that the object has its own properties and not from prototype chain
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            fetchedReels.push({
                id: key, // Ensure the ID is the Firebase key
                ...data[key]
            });
        }
      }
      // Sort by createdAt in descending order (newest first)
      // Ensure createdAt is a number for proper sorting
      const sortedReels = fetchedReels.sort((a, b) => 
        (typeof b.createdAt === 'number' ? b.createdAt : 0) - 
        (typeof a.createdAt === 'number' ? a.createdAt : 0)
      );
      console.log("reelService (getReels): Processed and sorted reels array:", sortedReels);
      console.log("reelService (getReels): Number of processed reels:", sortedReels.length);
      callback(sortedReels);
    } else {
      console.log("reelService (getReels): No data found in snapshot. Calling callback with empty array.");
      callback([]);
    }
  }, (error) => {
    console.error("reelService (getReels): Error fetching reels from Firebase:", error);
    callback([]); // Pass empty array in case of error
  });

  console.log("reelService (getReels): Returning unsubscribe function from onValue.");
  return unsubscribe; // Crucial: Return the unsubscribe function
};

export const likeReel = async (reelId: string) => {
  console.log("reelService (likeReel): Attempting to like reel:", reelId);
  const reelLikesRef = ref(database, `reels/${reelId}/likes`);
  
  try {
    await runTransaction(reelLikesRef, (currentLikes) => {
      if (currentLikes === null) {
        console.log("reelService (likeReel): Likes node is null, setting to 1 for reel:", reelId);
        return 1;
      }
      console.log("reelService (likeReel): Incrementing likes for reel:", reelId, "from", currentLikes);
      return currentLikes + 1;
    });
    console.log(`reelService (likeReel): Successfully liked reel: ${reelId}`);
  } catch (error) {
    console.error(`reelService (likeReel): Error liking reel ${reelId}:`, error);
    throw error;
  }
};

export const addComment = async (reelId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<string> => {
  console.log("reelService (addComment): Attempting to add comment to reel:", reelId, "Comment data:", commentData);
  const commentsListRef = ref(database, `reels/${reelId}/comments`);
  const newCommentRef = push(commentsListRef);

  if (!newCommentRef.key) {
    console.error("reelService (addComment): Failed to generate a unique key for the new comment on reel:", reelId);
    throw new Error('Failed to generate a unique key for the new comment.');
  }

  const newComment: Comment = {
    ...commentData,
    id: newCommentRef.key,
    createdAt: serverTimestamp(),
  };

  try {
    await update(ref(database), { [`reels/${reelId}/comments/${newComment.id}`]: newComment });
    console.log(`reelService (addComment): Comment added to reel ${reelId} with comment ID: ${newComment.id}`);
    return newComment.id;
  } catch (error) {
    console.error(`reelService (addComment): Error adding comment to reel ${reelId}:`, error);
    throw error;
  }
};
