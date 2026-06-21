import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CARDS = [
  { href: "/admin/homepage",      label: "Homepage",         icon: "🏠", desc: "Hero slides, join section, about text" },
  { href: "/admin/about",         label: "About Page",       icon: "ℹ",  desc: "Shepherd, doctrine, community content" },
  { href: "/admin/events",        label: "Events",           icon: "📅", desc: "Create, edit and delete events (appears everywhere)" },
  { href: "/admin/calendar",      label: "Calendar",         icon: "🗓",  desc: "Manage calendar entries" },
  { href: "/admin/ask-collins",   label: "Ask Collins",      icon: "💬", desc: "Review and publish questions" },
  { href: "/admin/join-us-live",  label: "Join Us Live",     icon: "▶",  desc: "YouTube settings and page content" },
  { href: "/admin/service-times", label: "Service Times",    icon: "⏰", desc: "Manage service schedule" },
  { href: "/admin/community",     label: "Community",        icon: "👥", desc: "Testimonials management" },
  { href: "/admin/media",         label: "Media Library",    icon: "🖼", desc: "Upload and manage images" },
  { href: "/admin/settings",      label: "Site Settings",    icon: "⚙",  desc: "Church info, contact details" },
  { href: "/admin/prayers",       label: "Prayer Requests",  icon: "🙏", desc: "View submitted prayer requests" },
  { href: "/admin/messages",      label: "Contact Messages", icon: "📩", desc: "View Write To Us submissions" },
];

export default async function AdminDashboard() {
  const session = await auth();

  let eventCount = 0, questionCount = 0, testimonialCount = 0,
      messageCount = 0, prayerCount = 0;

  try {
    [eventCount, questionCount, testimonialCount, messageCount, prayerCount] =
      await Promise.all([
        prisma.event.count({ where: { active: true } }).catch(() => 0),
        prisma.collinsQuestion.count({ where: { status: "PENDING", archived: false } }).catch(() => 0),
        prisma.testimonial.count().catch(() => 0),
        prisma.contactMessage.count({ where: { read: false, archived: false } }).catch(() => 0),
        prisma.prayerRequest.count({ where: { read: false, archived: false } }).catch(() => 0),
      ]);
  } catch (err) {
    console.error("Dashboard stats error:", err);
  }

  return (
    <div>
      <h1 className="font-playfair text-[24px] font-bold text-stone-900 mb-1">
        Welcome back, {session?.user?.name ?? "Admin"}
      </h1>
      <p className="font-lato text-[13px] text-stone-500 mb-8">
        Manage all church website content from here.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Active Events",      value: eventCount },
          { label: "Pending Questions",  value: questionCount },
          { label: "Unread Messages",    value: messageCount },
          { label: "Unread Prayers",     value: prayerCount },
          { label: "Testimonials",       value: testimonialCount },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-sm border border-stone-200 px-5 py-4">
            <p className="font-lato text-[10px] uppercase tracking-widest text-stone-400 mb-1">{s.label}</p>
            <p className="font-playfair text-[28px] font-bold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Section cards — no event handlers (Server Component) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(c => (
          <Link key={c.href} href={c.href}
            className="bg-white border border-stone-200 rounded-sm p-5 no-underline
                       hover:shadow-sm hover:border-[#8c3a63] transition-all group">
            <div className="flex items-start gap-3">
              <span className="text-[22px] mt-0.5">{c.icon}</span>
              <div>
                <p className="font-lato font-bold text-[14px] text-stone-900 transition-colors group-hover:text-[#8c3a63]">
                  {c.label}
                </p>
                <p className="font-lato text-[12px] text-stone-400 mt-0.5">{c.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
