"use client";

import { useLanguage } from "@/hooks/useLanguage";
import YouTubeLivePlayer from "@/components/join-us-live/youtube-live-player";
import PreviousSermons from "@/components/join-us-live/previous-sermons";
import JoinAskCollins from "@/components/ask-collins/JoinAskCollins";
import type { YouTubeVideo } from "@/types/youtube";

interface Props {
  mainVideo: YouTubeVideo | null;
  isCurrentlyLive: boolean;
  recentSermons: YouTubeVideo[];
  embedUrl: string;
  watchUrl: string;
  youtubeChannelUrl: string;
  isApiUnavailable: boolean;
}

export default function JoinUsLiveClient({
  mainVideo,
  isCurrentlyLive,
  recentSermons,
  embedUrl,
  watchUrl,
  youtubeChannelUrl,
  isApiUnavailable,
}: Props) {
  const { lang, t } = useLanguage();

  return (
    <>
      {!isApiUnavailable && (
        <section className="px-4 sm:px-10 pt-8 pb-4 bg-white">
          <div className="max-w-[1280px] mx-auto">
            {isCurrentlyLive && (
              <p className="font-lato text-[11px] uppercase tracking-widest text-red-600 font-bold mb-2">
                {lang === "ta" ? "● நேரலை" : "● Live Now"}
              </p>
            )}
            <YouTubeLivePlayer
              video={mainVideo}
              embedUrl={embedUrl}
              watchUrl={watchUrl}
              isLive={isCurrentlyLive}
            />
          </div>
        </section>
      )}

      {isApiUnavailable ? (
        <section className="px-4 sm:px-10 py-12 bg-white">
          <div className="max-w-[1280px] mx-auto text-center border border-stone-200/60 rounded-lg p-10 bg-stone-50">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-playfair text-[18px] font-semibold text-stone-800 mb-2">
              {lang === "ta" ? "யூடியூப் ஊட்டம் தற்காலிகமாக முடக்கப்பட்டுள்ளது" : "YouTube Feed Temporarily Offline"}
            </h4>
            <p className="font-lato text-[13px] text-stone-500 max-w-[420px] mx-auto mb-5">
              {lang === "ta"
                ? "தற்போது தளம் மூலம் நேரடி வீடியோக்களை ஏற்ற முடியவில்லை. நேரடி ஒளிபரப்பைக் காண அல்லது முந்தைய வீடியோக்களைப் பார்க்க எங்கள் யூடியூப் பக்கத்தைப் பார்வையிடவும்."
                : "We are unable to load the latest sermons directly on the site right now. Please watch the live stream or browse uploads directly on our YouTube channel."}
            </p>
            <a
              href={youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-lato text-[11px] font-bold uppercase tracking-wider bg-[var(--burgundy)] hover:bg-[var(--burgundy-dark)] text-white px-6 py-3 rounded-sm transition-all duration-200 no-underline"
            >
              {lang === "ta" ? "யூடியூபில் காண்க" : "Watch on YouTube"}
            </a>
          </div>
        </section>
      ) : (
        <PreviousSermons sermons={recentSermons} />
      )}
      <JoinAskCollins defaultVideoName={mainVideo?.title ?? ""} />
    </>
  );
}
