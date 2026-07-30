import Navbar from "@/components/ui/Navbar";
import FooterContact from "@/components/ui/FooterContact";
import AnswerDetailClient from "@/components/ask-collins/AnswerDetailClient";
import { fetchAnswerById, fetchFooter } from "@/lib/sanity-queries";
import { getAllSettings } from "@/lib/settings";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const ALL_ANSWERS_STATIC = [
  { id: "1", title: "Try Jesus", titleTa: "இயேசுவை தேடுங்கள்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: "2", title: "The Word of God", titleTa: "தேவனுடைய வார்த்தை", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: "3", title: "Faith Over Fear", titleTa: "பயத்திற்கு மேல் விசுவாசம்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: "4", title: "Grace and Truth", titleTa: "கிருபையும் சத்தியமும்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: "5", title: "Walking in the Spirit", titleTa: "ஆவியிலே நடத்தல்", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: "6", title: "The Power of Prayer", titleTa: "ஜெபத்தின் வல்லமை", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." },
  { id: "7", title: "Renewed Every Morning", titleTa: "காலைதோறும் புதிய கிருபை", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls." }
];

export default async function AnswerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let answer = await fetchAnswerById(id).catch(() => null);

  // Fallback for static items (useful during seeding/local verification)
  if (!answer) {
    const staticItem = ALL_ANSWERS_STATIC.find((a) => String(a.id) === String(id));
    if (staticItem) {
      answer = {
        _id: staticItem.id,
        title: staticItem.title,
        titleTa: staticItem.titleTa,
        question: staticItem.title,
        questionTa: staticItem.titleTa,
        answer: staticItem.body,
        answerTa: staticItem.body, // static backups can use fallback
        imageUrl: `/images/answers/answer-${staticItem.id}.jpg`,
        category: "Faith",
        categoryTa: "விசுவாசம்",
        publishDate: new Date().toISOString(),
        excerpt: staticItem.body.slice(0, 160) + "...",
      };
    }
  }

  if (!answer) {
    notFound();
  }

  const [settings, footer] = await Promise.all([
    getAllSettings(),
    fetchFooter(),
  ]);

  const contact = {
    address: footer?.address ?? settings.church_address ?? "75, Anna Salai, Chennai, Tamil Nadu 600002, India.",
    addressTa: footer?.addressTa ?? settings.church_address_ta ?? "75, அண்ணா சாலை, சென்னை, தமிழ்நாடு 600002, இந்தியா.",
    phone:   footer?.phone   ?? settings.church_phone   ?? "+91 98876 54321",
    email:   footer?.email   ?? settings.church_email   ?? "info@cftchurch.com",
    mapUrl:  footer?.mapEmbed  ?? settings.map_embed_url  ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  return (
    <main className="bg-white min-h-screen flex flex-col">
      <Navbar />
      
      <AnswerDetailClient answer={answer} />

      <FooterContact {...contact} />
      
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}
