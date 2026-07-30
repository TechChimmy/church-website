// types/youtube.ts

export interface YouTubeVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  isLive: boolean;
  isUpcoming?: boolean;
  isCompletedLive?: boolean;
}

export interface YouTubeLiveResult {
  mainVideo: YouTubeVideo | null;
  isCurrentlyLive: boolean;
  recentSermons: YouTubeVideo[];
}
