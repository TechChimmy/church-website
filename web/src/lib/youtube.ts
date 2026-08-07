// lib/youtube.ts
// Server-side only — never imported in client components directly.
// API key stays server-side via process.env.

import type { YouTubeVideo, YouTubeLiveResult } from "@/types/youtube";

const BASE = "https://www.googleapis.com/youtube/v3";

/** Fetch a single resource from the YouTube Data API. */
async function ytFetch(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string
) {
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.error("[YouTube API] Missing API Key");
    }
    return null;
  }

  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(3000), // Timeout after 3 seconds
      next: { revalidate: 300 } // Cache YouTube API requests for 5 minutes
    });

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        const errJson = await res.json().catch(() => null);
        console.error(
          `[YouTube API Error] Endpoint: ${endpoint}, Status: ${res.status}`,
          JSON.stringify(errJson, null, 2)
        );
      }
      return null;
    }

    return res.json();
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      if (err?.name === "TimeoutError" || err?.name === "AbortError") {
        console.warn(`[YouTube API Warning] Endpoint '${endpoint}' request timed out after 3s.`);
      } else {
        console.error(`[YouTube API Connection Error] Endpoint: ${endpoint}`, err?.message || String(err));
      }
    }
    return null;
  }
}

const channelIdCache = new Map<string, string>();

const globalForYouTube = globalThis as unknown as {
  cachedVideoData: YouTubeLiveResult | null;
  lastFetchTime: number;
  isFetchingBackground: boolean;
};

if (globalForYouTube.cachedVideoData === undefined) {
  globalForYouTube.cachedVideoData = null;
  globalForYouTube.lastFetchTime = 0;
  globalForYouTube.isFetchingBackground = false;
}

const CACHE_DURATION = 60000; // 60 seconds TTL to balance performance and real-time updates

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
  liveStreamingDetails?: {
    actualStartTime?: string;
    actualEndTime?: string;
    scheduledStartTime?: string;
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

  let publishedAt = snippet.publishedAt ?? "";

  // Try to parse DD/MM/YYYY or DD-MM-YYYY date format from title
  const title = snippet.title ?? "";
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
  const match = title.match(dateRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JS month is 0-indexed
    const year = parseInt(match[3], 10);
    const parsedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
    if (!isNaN(parsedDate.getTime())) {
      publishedAt = parsedDate.toISOString();
    }
  }

  return {
    videoId,
    title: snippet.title ?? "Sermon",
    publishedAt,
    thumbnail: thumb,
    isLive: snippet.liveBroadcastContent === "live",
    isUpcoming: snippet.liveBroadcastContent === "upcoming",
    isCompletedLive: !!item.liveStreamingDetails?.actualEndTime,
  };
}

/** Helper to resolve handle or channel URL to standard Channel ID */
async function resolveChannelId(input: string, apiKey: string): Promise<string> {
  if (!input) return "";
  input = input.trim();

  // Return cached channel ID if available
  if (channelIdCache.has(input)) {
    return channelIdCache.get(input)!;
  }

  let resolvedId = input;

  // 1. Standard 24-char Channel ID starting with UC
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(input)) {
    resolvedId = input;
  }
  // 2. Full URL containing /channel/UCxxxxxxxxxx
  else {
    const urlMatch = input.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
    if (urlMatch) {
      resolvedId = urlMatch[1];
    }
    // 3. Handle extract (e.g. /@channelhandle)
    else {
      let handle = "";
      const handleMatch = input.match(/\/(@[a-zA-Z0-9_.-]+)/);
      if (handleMatch) {
        handle = handleMatch[1];
      } else if (input.startsWith("@")) {
        handle = input;
      } else if (/^[a-zA-Z0-9_.-]+$/.test(input) && !input.startsWith("UC")) {
        handle = `@${input}`;
      }

      if (handle) {
        try {
          const res = await ytFetch("channels", {
            part: "id",
            forHandle: handle,
          }, apiKey);
          const foundId = res?.items?.[0]?.id;
          if (foundId) {
            resolvedId = foundId;
          }
        } catch (e) {
          console.error("Error resolving YouTube handle:", e);
        }
      }
    }
  }

  // Cache resolved channel ID
  if (resolvedId && resolvedId !== input) {
    channelIdCache.set(input, resolvedId);
  }

  return resolvedId;
}

// Background fetching status is now stored on globalForYouTube

async function fetchChannelVideoData(
  channelIdInput: string,
  apiKey: string,
  emptyResult: YouTubeLiveResult
): Promise<YouTubeLiveResult> {
  const channelId = await resolveChannelId(channelIdInput, apiKey);

  // Helper to fetch uploads using playlistItems + videos (only costs 2 quota units!)
  const fetchUploadsFromPlaylist = async (): Promise<YouTubeVideo[]> => {
    const uploadsPlaylistId = "UU" + channelId.substring(2);
    
    const playlistData = await ytFetch("playlistItems", {
      part: "snippet",
      playlistId: uploadsPlaylistId,
      maxResults: "30",
    }, apiKey);

    const items = playlistData?.items ?? [];
    const videoIds = items
      .map((item: any) => item.snippet?.resourceId?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) return [];

    const videosData = await ytFetch("videos", {
      part: "id,snippet,liveStreamingDetails",
      id: videoIds.join(","),
    }, apiKey);

    return (videosData?.items ?? [])
      .map((item: any) => mapItem(item))
      .filter((v: YouTubeVideo | null): v is YouTubeVideo => v !== null);
  };

  // Check for active live stream (Priority 1)
  const checkLiveStream = async (): Promise<YouTubeVideo | null> => {
    try {
      const url = `https://www.youtube.com/channel/${channelId}/live`;
      // Use 3 seconds in development to avoid compilation delays, and 2.5 seconds in production
      const timeoutMs = process.env.NODE_ENV === "development" ? 3000 : 2500;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(timeoutMs),
        next: { revalidate: 60 } // Cache the fetch response for 60 seconds
      });
      if (res.ok) {
        const text = await res.text();
        const canonicalMatch = text.match(/<link rel="canonical" href="([^"]+)">/);
        if (canonicalMatch && canonicalMatch[1].includes("/watch?v=")) {
          const videoId = canonicalMatch[1].split("/watch?v=")[1]?.split("&")[0];
          if (videoId) {
            // Channel is live! Fetch its metadata using the cheap 'videos' endpoint (only 1 unit quota cost)
            const liveData = await ytFetch("videos", {
              part: "id,snippet,liveStreamingDetails",
              id: videoId,
            }, apiKey);

            const liveItem = liveData?.items?.[0] ?? null;
            if (liveItem) {
              return mapItem(liveItem);
            } else {
              // Fallback if API key is invalid/rate-limited but we know the video ID and it is live
              return {
                videoId,
                title: "Live Stream",
                publishedAt: new Date().toISOString(),
                thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                isLive: true,
                isUpcoming: false,
                isCompletedLive: false,
              };
            }
          }
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[YouTube API Warning] Live stream check failed. Falling back to uploads playlist. Reason:",
          e instanceof Error ? e.message : String(e)
        );
      }
    }
    return null;
  };

  // Run BOTH checks in parallel using Promise.allSettled
  const [uploadsResult, liveVideoResult] = await Promise.allSettled([
    fetchUploadsFromPlaylist(),
    checkLiveStream()
  ]);

  const uploads = uploadsResult.status === "fulfilled" ? uploadsResult.value : [];
  const liveVideo = liveVideoResult.status === "fulfilled" ? liveVideoResult.value : null;

  // Filter out upcoming videos
  const activeUploads = uploads.filter(v => !v.isUpcoming);

  // Sort uploads chronologically by parsed/published date (newest first)
  activeUploads.sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    return timeB - timeA;
  });

  if (activeUploads.length === 0 && !liveVideo) {
    return emptyResult;
  }

  if (liveVideo && !liveVideo.isUpcoming) {
    // Priority 1: Channel IS live — build recent list (excluding live video)
    const sermons = activeUploads
      .filter(v => v.videoId !== liveVideo.videoId)
      .slice(0, 24);

    return {
      mainVideo: liveVideo,
      isCurrentlyLive: true,
      recentSermons: sermons,
    };
  }

  // If live check was rate-limited or failed, check if latest upload is marked as active live
  const activeLiveFromUploads = activeUploads.find(v => v.isLive);
  if (activeLiveFromUploads) {
    const sermons = activeUploads
      .filter(v => v.videoId !== activeLiveFromUploads.videoId)
      .slice(0, 24);

    return {
      mainVideo: activeLiveFromUploads,
      isCurrentlyLive: true,
      recentSermons: sermons,
    };
  }

  // Priority 2: Find the most recently completed livestream from the uploads list
  const completedVideo = activeUploads.find(v => v.isCompletedLive);
  if (completedVideo) {
    const sermons = activeUploads
      .filter(v => v.videoId !== completedVideo.videoId)
      .slice(0, 24);

    return {
      mainVideo: completedVideo,
      isCurrentlyLive: false,
      recentSermons: sermons,
    };
  }

  // Priority 3: Fallback: Latest uploaded video
  if (activeUploads.length > 0) {
    const mainVideo = activeUploads[0];
    const sermons = activeUploads.slice(1, 25); // next 24 as "previous sermons"

    return {
      mainVideo,
      isCurrentlyLive: false,
      recentSermons: sermons,
    };
  }

  return emptyResult;
}

/**
 * Main function: detects if channel is live, returns the correct
 * main video (live stream OR latest completed live stream OR latest uploaded video) and the 4 most recent sermons.
 */
export async function getChannelVideoData(): Promise<YouTubeLiveResult> {
  const apiKey = process.env.YOUTUBE_API_KEY || "";
  const channelIdInput = process.env.YOUTUBE_CHANNEL_ID || "";

  const emptyResult: YouTubeLiveResult = {
    mainVideo: null,
    isCurrentlyLive: false,
    recentSermons: [],
  };

  if (!apiKey || !channelIdInput || apiKey === "your_youtube_api_key" || channelIdInput === "your_channel_id") {
    return emptyResult;
  }

  const now = Date.now();

  // Stale-While-Revalidate: Return cached data immediately and trigger background refresh if stale
  if (globalForYouTube.cachedVideoData) {
    const isStale = now - globalForYouTube.lastFetchTime >= CACHE_DURATION;
    if (isStale && !globalForYouTube.isFetchingBackground) {
      globalForYouTube.isFetchingBackground = true;
      fetchChannelVideoData(channelIdInput, apiKey, emptyResult)
        .then((data) => {
          globalForYouTube.cachedVideoData = data;
          globalForYouTube.lastFetchTime = Date.now();
        })
        .catch((err) => {
          if (process.env.NODE_ENV === "development") {
            console.error("[YouTube API] Background refresh failed:", err);
          }
        })
        .finally(() => {
          globalForYouTube.isFetchingBackground = false;
        });
    }
    return globalForYouTube.cachedVideoData;
  }

  // First request: fetch with a 2.5s max budget so initial page load is fast and never blocked
  try {
    const fetchPromise = fetchChannelVideoData(channelIdInput, apiKey, emptyResult).then((data) => {
      globalForYouTube.cachedVideoData = data;
      globalForYouTube.lastFetchTime = Date.now();
      return data;
    });

    const timeoutPromise = new Promise<YouTubeLiveResult>((resolve) => {
      setTimeout(() => resolve(emptyResult), 2500);
    });

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error fetching YouTube video data:", error);
    return emptyResult;
  }
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
