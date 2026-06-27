import Navbar from "@/components/Navbar";
import FooterContact from "@/components/FooterContact";
import ServiceTimes from "@/components/ServiceTimes";
import YouTubeLivePlayer from "@/components/youtube-live-player";
import PreviousSermons from "@/components/previous-sermons";
import JoinAskCollins from "@/components/JoinAskCollins";
import { getChannelVideoData, buildEmbedUrl, buildWatchUrl } from "@/lib/youtube";
import { getAllSettings } from "@/lib/settings";
import { fetchFooter } from "@/lib/sanity-queries";

export const metadata = {
  title: "Join Us Live — Christian Fellowship Church",
  description: "Watch our live Sunday service or catch up on recent sermons.",
};

export const dynamic = "force-dynamic";

export default async function JoinUsLivePage() {
  const [{ mainVideo, isCurrentlyLive, recentSermons }, settings, footer] = await Promise.all([
    getChannelVideoData(),
    getAllSettings(),
    fetchFooter(),
  ]);

  const embedUrl = mainVideo ? buildEmbedUrl(mainVideo.videoId, isCurrentlyLive) : "";
  const watchUrl = mainVideo ? buildWatchUrl(mainVideo.videoId) : "https://www.youtube.com";

  const contact = {
    address: footer?.address ?? settings.church_address ?? "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
    phone: footer?.phone ?? settings.church_phone ?? "+91 98876 54321",
    email: footer?.email ?? settings.church_email ?? "info@cftchurch.com",
    mapUrl: footer?.mapEmbed ?? settings.map_embed_url ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  const sermonsToDisplay = recentSermons;

  const isApiUnavailable = !mainVideo && recentSermons.length === 0;

  const rawChannelId = process.env.YOUTUBE_CHANNEL_ID || settings.youtube_channel_id || "";
  const hasChannelLink = rawChannelId && rawChannelId !== "your_channel_id";
  const youtubeChannelUrl = hasChannelLink
    ? (rawChannelId.startsWith("http") ? rawChannelId : `https://www.youtube.com/channel/${rawChannelId}`)
    : "https://www.youtube.com";

  return (
    <main>
      <Navbar />
      {!isApiUnavailable && (
        <section className="px-4 sm:px-10 pt-8 pb-4 bg-white">
          <div className="max-w-[1280px] mx-auto">
            {isCurrentlyLive && (
              <p className="font-lato text-[11px] uppercase tracking-widest text-red-600 font-bold mb-2">
                ● Live Now
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
              YouTube Feed Temporarily Offline
            </h4>
            <p className="font-lato text-[13px] text-stone-500 max-w-[420px] mx-auto mb-5">
              We are unable to load the latest sermons directly on the site right now. Please watch the live stream or browse uploads directly on our YouTube channel.
            </p>
            <a
              href={youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-lato text-[11px] font-bold uppercase tracking-wider bg-[var(--burgundy)] hover:bg-[var(--burgundy-dark)] text-white px-6 py-3 rounded-sm transition-all duration-200 no-underline"
            >
              Watch on YouTube
            </a>
          </div>
        </section>
      ) : (
        <PreviousSermons 
          sermons={sermonsToDisplay} 
          title="Previous Sermons"
        />
      )}
      <JoinAskCollins />
      <ServiceTimes />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
