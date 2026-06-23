import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/sanity/lib/client";

const NAV_CARDS = [
  { href: "/studio",              label: "CMS Studio",       icon: "📝", desc: "Open Sanity Studio CMS editor", target: "_blank" },
  { href: "/admin/homepage",      label: "Homepage",         icon: "🏠", desc: "Hero slides, join section, about text" },
  { href: "/admin/events",        label: "Events",           icon: "📅", desc: "Create, edit and delete events" },
  { href: "/admin/calendar",      label: "Calendar",         icon: "🗓",  desc: "Manage calendar entries" },
  { href: "/admin/prayers",       label: "Prayer Requests",  icon: "🙏", desc: "View submitted prayer requests" },
  { href: "/admin/ask-collins",   label: "Ask Collins",      icon: "💬", desc: "Review and publish questions" },
  { href: "/admin/about",         label: "About Page",       icon: "ℹ",  desc: "Shepherd, doctrine, community content" },
  { href: "/admin/join-us-live",  label: "Join Us Live",     icon: "▶",  desc: "YouTube settings and page content" },
  { href: "/admin/service-times", label: "Service Times",    icon: "⏰", desc: "Manage service schedule" },
  { href: "/admin/community",     label: "Community",        icon: "👥", desc: "Testimonials management" },
  { href: "/admin/media",         label: "Media Library",    icon: "🖼", desc: "Upload and manage images" },
  { href: "/admin/settings",      label: "Site Settings",    icon: "⚙",  desc: "Church info, contact details" },
  { href: "/admin/messages",      label: "Contact Messages", icon: "📩", desc: "View Write To Us submissions" },
];

export default async function AdminDashboard() {
  const session = await auth();

  let eventCount = 0, questionCount = 0, testimonialCount = 0,
      messageCount = 0, prayerCount = 0, mediaCount = 0;

  try {
    const client = getSanityClient();
    [eventCount, questionCount, testimonialCount, messageCount, prayerCount, mediaCount] =
      await Promise.all([
        client.fetch<number>(`count(*[_type == "event" && active == true])`).catch(() => 0),
        client.fetch<number>(`count(*[_type == "collinsQuestion" && status == "PENDING" && archived == false])`).catch(() => 0),
        client.fetch<number>(`count(*[_type == "testimonial"])`).catch(() => 0),
        client.fetch<number>(`count(*[_type == "contactMessage" && read == false && archived == false])`).catch(() => 0),
        client.fetch<number>(`count(*[_type == "prayerRequest" && read == false && archived == false])`).catch(() => 0),
        client.fetch<number>(`count(*[_type == "sanity.imageAsset"])`).catch(() => 0),
      ]);
  } catch (err) {
    console.error("Dashboard stats error:", err);
  }


  const stats = [
    { label: "Active Events",     value: eventCount,       href: "/admin/events",       urgent: false },
    { label: "Pending Questions", value: questionCount,    href: "/admin/ask-collins",  urgent: questionCount > 0 },
    { label: "Unread Messages",   value: messageCount,     href: "/admin/messages",     urgent: messageCount > 0 },
    { label: "Unread Prayers",    value: prayerCount,      href: "/admin/prayers",      urgent: prayerCount > 0 },
    { label: "Testimonials",      value: testimonialCount, href: "/admin/community",    urgent: false },
    { label: "Media Files",       value: mediaCount,       href: "/admin/media",        urgent: false },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-playfair text-[26px] font-bold" style={{ color: "var(--text-dark)" }}>
          Welcome back, {session?.user?.name ?? "Admin"}
        </h1>
        <p className="font-lato text-[13px] mt-1" style={{ color: "#9B8A90" }}>
          Manage all church website content from here.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            prefetch={false}
            className="rounded-sm px-4 py-4 no-underline block transition-shadow hover:shadow-md"
            style={{
              backgroundColor: s.urgent ? "var(--burgundy)" : "white",
              border: s.urgent ? "none" : "1px solid rgba(140,58,99,0.1)",
              boxShadow: s.urgent
                ? "0 4px 20px rgba(140,58,99,0.25)"
                : "0 2px 8px rgba(140,58,99,0.04)",
            }}
          >
            <p
              className="font-lato text-[9px] font-bold uppercase tracking-widest mb-1.5"
              style={{ color: s.urgent ? "rgba(255,255,255,0.65)" : "#9B8A90" }}
            >
              {s.label}
            </p>
            <p
              className="font-playfair text-[28px] font-bold leading-none"
              style={{ color: s.urgent ? "white" : "var(--text-dark)" }}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1" style={{ backgroundColor: "rgba(140,58,99,0.1)" }} />
        <p className="font-lato text-[10px] font-bold uppercase tracking-widest" style={{ color: "#9B8A90" }}>
          Sections
        </p>
        <div className="h-px flex-1" style={{ backgroundColor: "rgba(140,58,99,0.1)" }} />
      </div>

      {/* Section cards — Server Component safe: no event handlers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {NAV_CARDS.map(c => (
          <Link
            key={c.href}
            href={c.href}
            target={c.target}
            rel={c.target === "_blank" ? "noopener noreferrer" : undefined}
            prefetch={false}
            className="bg-white rounded-sm px-5 py-4 no-underline block
                       transition-all hover:shadow-md group"
            style={{ border: "1px solid rgba(140,58,99,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0 text-[18px]"
                style={{ backgroundColor: "rgba(140,58,99,0.07)" }}
              >
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="font-lato font-bold text-[13px] leading-tight
                             group-hover:text-[var(--burgundy)] transition-colors"
                  style={{ color: "var(--text-dark)" }}
                >
                  {c.label}
                </p>
                <p className="font-lato text-[11px] mt-0.5 truncate" style={{ color: "#9B8A90" }}>
                  {c.desc}
                </p>
              </div>
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none" stroke="var(--burgundy)" strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
