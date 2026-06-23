// lib/youtube.ts
// Server-side only — never imported in client components directly.
// API key stays server-side via process.env.

import type { YouTubeVideo, YouTubeLiveResult } from "@/types/youtube";

const API_KEY     = process.env.YOUTUBE_API_KEY     ?? "";
const CHANNEL_ID  = process.env.YOUTUBE_CHANNEL_ID  ?? "";

const BASE = "https://www.googleapis.com/youtube/v3";

/** Fetch a single resource from the YouTube Data API. */
async function ytFetch(endpoint: string, params: Record<string, string>) {
  if (!API_KEY || !CHANNEL_ID) return null;

  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // re-check every 60 seconds
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Map a YouTube search/videos item to our YouTubeVideo shape. */
function mapItem(item: {
  id?: { videoId?: string } | string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
    liveBroadcastContent?: string;
  };
}): YouTubeVideo | null {
  const videoId =
    typeof item.id === "string"
      ? item.id
      : (item.id as { videoId?: string })?.videoId;

  if (!videoId) return null;

  const snippet = item.snippet ?? {};
  const thumb =
    snippet.thumbnails?.high?.url ??
    snippet.thumbnails?.medium?.url ??
    snippet.thumbnails?.default?.url ??
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return {
    videoId,
    title: snippet.title ?? "Sermon",
    publishedAt: snippet.publishedAt ?? "",
    thumbnail: thumb,
    isLive: snippet.liveBroadcastContent === "live",
  };
}

/**
 * Main function: detects if channel is live, returns the correct
 * main video (live stream OR latest sermon) and the 4 most recent sermons.
 */
export async function getChannelVideoData(): Promise<YouTubeLiveResult> {
  // ── 1. Check for active live stream ──
  const liveData = await ytFetch("search", {
    part: "id,snippet",
    channelId: CHANNEL_ID,
    eventType: "live",
    type: "video",
    maxResults: "1",
  });

  const liveItem =
    liveData?.items?.[0] ?? null;
  const liveVideo = liveItem ? mapItem(liveItem) : null;

  if (liveVideo) {
    // Channel IS live — fetch 4 recent sermons for the grid (excluding live)
    const recentData = await ytFetch("search", {
      part: "id,snippet",
      channelId: CHANNEL_ID,
      order: "date",
      type: "video",
      maxResults: "5",
    });

    const sermons: YouTubeVideo[] = (recentData?.items ?? [])
      .map((item: Parameters<typeof mapItem>[0]) => mapItem(item))
      .filter(
        (v: YouTubeVideo | null): v is YouTubeVideo =>
          v !== null && v.videoId !== liveVideo.videoId
      )
      .slice(0, 4);

    return {
      mainVideo: liveVideo,
      isCurrentlyLive: true,
      recentSermons: sermons,
    };
  }

  // ── 2. No live stream — get latest uploaded video as main ──
  const latestData = await ytFetch("search", {
    part: "id,snippet",
    channelId: CHANNEL_ID,
    order: "date",
    type: "video",
    maxResults: "5",
  });

  const allVideos: YouTubeVideo[] = (latestData?.items ?? [])
    .map((item: Parameters<typeof mapItem>[0]) => mapItem(item))
    .filter((v: YouTubeVideo | null): v is YouTubeVideo => v !== null);

  const mainVideo  = allVideos[0] ?? null;
  const sermons    = allVideos.slice(1, 5); // next 4 as "previous sermons"

  return {
    mainVideo,
    isCurrentlyLive: false,
    recentSermons: sermons,
  };
}

/** Build the YouTube embed URL for a given videoId. */
export function buildEmbedUrl(
  videoId: string,
  isLive: boolean
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    autoplay: "0",
    ...(isLive ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/** Build the canonical YouTube watch URL. */
export function buildWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
