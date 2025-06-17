
export interface Reel {
  id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  likes: number;
  comments: Comment[];
  createdAt: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: number;
}
