import Navbar from "@/components/Navbar";
import FooterContact from "@/components/FooterContact";
import AskCollinsHero from "@/components/AskCollinsHero";
import AskCollinsForm from "@/components/AskCollinsForm";
import AnsweredQuestions from "@/components/AnsweredQuestions";
import AnswersFromTheWord from "@/components/AnswersFromTheWord";
import OurCommunityServer from "@/components/OurCommunityServer";
import { getAllSettings } from "@/lib/settings";
import { fetchAnswersFromTheWord, fetchFooter, fetchPublishedQuestions } from "@/lib/sanity-queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ask Collins — Christian Fellowship Church",
  description: "Submit your questions to Pastor Collins and find answers from the Word.",
};

export default async function AskCollinsPage() {
  const [settings, answers, publishedQuestions, footer] = await Promise.all([
    getAllSettings(),
    fetchAnswersFromTheWord({ activeOnly: true }).catch(() => []),
    fetchPublishedQuestions().catch(() => []),
    fetchFooter(),
  ]);

  const contact = {
    address: footer?.address ?? settings.church_address ?? "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
    addressTa: footer?.addressTa ?? settings.church_address_ta ?? "75, அண்ணா சாலை, சென்னை,\nதமிழ்நாடு 600002, இந்தியா.",
    phone: footer?.phone ?? settings.church_phone ?? "+91 98876 54321",
    email: footer?.email ?? settings.church_email ?? "info@cftchurch.com",
    mapUrl: footer?.mapEmbed ?? settings.map_embed_url ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  };

  return (
    <main>
      <Navbar />
      <AskCollinsHero />
      <AskCollinsForm />
      <AnsweredQuestions questions={publishedQuestions} />
      <AnswersFromTheWord initialAnswers={answers} />
      <OurCommunityServer />
      <FooterContact {...contact} />
      <div className="bg-black text-center text-[11px] tracking-wide text-white/30 py-3 font-lato">
        &copy; {new Date().getFullYear()} Christian Fellowship Church. All rights reserved.
      </div>
    </main>
  );
}

