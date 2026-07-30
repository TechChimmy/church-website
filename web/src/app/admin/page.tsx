import { auth } from "@/lib/auth";
import { getSanityClient } from "@/lib/sanity/client";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboard() {
  const session = await auth();

  let eventCount = 0, questionCount = 0, testimonialCount = 0,
      messageCount = 0, prayerCount = 0, mediaCount = 0, galleryCount = 0, announcementCount = 0;

  try {
    const client = getSanityClient(false);
    const counts = await client.fetch<{
      eventCount: number;
      questionCount: number;
      testimonialCount: number;
      messageCount: number;
      prayerCount: number;
      mediaCount: number;
      galleryCount: number;
      announcementCount: number;
    }>(`{
      "eventCount": count(*[_type == "event" && active == true]),
      "questionCount": count(*[_type == "collinsQuestion" && status == "PENDING" && archived == false]),
      "testimonialCount": count(*[_type == "community"]),
      "messageCount": count(*[_type == "contactMessage" && read == false && archived == false]),
      "prayerCount": count(*[_type == "prayerRequest" && read == false && archived == false]),
      "mediaCount": count(*[_type == "sanity.imageAsset"]),
      "galleryCount": count(*[_type == "galleryImage"]),
      "announcementCount": count(*[_type == "announcement" && active == true])
    }`);
    eventCount = counts.eventCount ?? 0;
    questionCount = counts.questionCount ?? 0;
    testimonialCount = counts.testimonialCount ?? 0;
    messageCount = counts.messageCount ?? 0;
    prayerCount = counts.prayerCount ?? 0;
    mediaCount = counts.mediaCount ?? 0;
    galleryCount = counts.galleryCount ?? 0;
    announcementCount = counts.announcementCount ?? 0;
  } catch (err) {
    console.error("Dashboard stats error:", err);
  }

  const countsObj = {
    eventCount,
    questionCount,
    testimonialCount,
    messageCount,
    prayerCount,
    mediaCount,
    galleryCount,
    announcementCount,
  };

  const sessionName = session?.user?.name ?? "Admin";

  return <AdminDashboardClient counts={countsObj} sessionName={sessionName} />;
}
