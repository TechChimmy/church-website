// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database...");

  // ── Admin user ──
  const hash = await bcrypt.hash("Admin@CFT2025", 12);
  await prisma.user.upsert({
    where: { email: "admin@cftchurch.com" },
    update: {},
    create: {
      email: "admin@cftchurch.com",
      name: "Church Admin",
      passwordHash: hash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅  Admin user created: admin@cftchurch.com / Admin@CFT2025");

  // ── Hero Slides ──
  await prisma.heroSlide.createMany({
    skipDuplicates: true,
    data: [
      { title: "Welcome Home", subtitle: "Sunday Service · 9am & 11am", ctaText: "Join Us Live", ctaHref: "/join-us-live", imageUrl: "", order: 0 },
      { title: "Faith. Hope. Love.", subtitle: "Building a community rooted in Christ", ctaText: "About Us", ctaHref: "/about", imageUrl: "", order: 1 },
      { title: "Come as You Are", subtitle: "You are welcome here, always", ctaText: "Visit Us", ctaHref: "/about#visit", imageUrl: "", order: 2 },
    ],
  });

  // ── Service Times ──
  await prisma.serviceTime.createMany({
    skipDuplicates: true,
    data: [
      { title: "Service of this kind", day: "Sunday", time: "12:00 AM to 03:00 AM", order: 0 },
      { title: "Service of this kind", day: "Sunday", time: "12:00 to 03:05 AM",    order: 1 },
      { title: "Service of this kind", day: "Sunday", time: "12:00 AM to 03:00 AM", order: 2 },
      { title: "Service of this kind", day: "Sunday", time: "12:05 AM to 03:00 AM", order: 3 },
    ],
  });

  // ── Testimonials ──
  await prisma.testimonial.createMany({
    skipDuplicates: true,
    data: [
      { name: "Blake & Kay", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The gentle nature accompanies the scene, with birds chirping melodiously and bees buzzing from flower to flower in the vibrant garden. This idyllic setting is a reminder of the simple joys of life, where the hustle and bustle of everyday life fades away, leaving only peace and serenity.", order: 0 },
      { name: "James & Ruth", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside village. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, crafting an atmosphere of pure contentment and belonging.", order: 1 },
      { name: "Michael & Sarah", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon. The gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight.", order: 2 },
    ],
  });

  // ── Site Settings ──
  const settings = [
    // General
    { key: "church_name",      value: "Christian Fellowship Church", label: "Church Name",        group: "general", type: "text" },
    { key: "church_address",   value: "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.", label: "Address", group: "general", type: "textarea" },
    { key: "church_phone",     value: "+91 98876 54321",             label: "Phone",              group: "general", type: "text" },
    { key: "church_email",     value: "info@cftchurch.com",          label: "Email",              group: "general", type: "text" },
    { key: "map_embed_url",    value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000", label: "Map Embed URL", group: "general", type: "url" },
    // About
    { key: "about_heading",    value: "About Us",                    label: "About Heading",      group: "about",   type: "text" },
    { key: "about_body",       value: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, crafting an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory.", label: "About Body", group: "about", type: "textarea" },
    { key: "about_image",      value: "",                            label: "About Image",        group: "about",   type: "image" },
    // Shepherd
    { key: "shepherd_heading", value: "Our Shepherd",                label: "Shepherd Heading",   group: "shepherd", type: "text" },
    { key: "shepherd_body",    value: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment.", label: "Shepherd Body", group: "shepherd", type: "textarea" },
    { key: "shepherd_image",   value: "",                            label: "Shepherd Image",     group: "shepherd", type: "image" },
    // YouTube
    { key: "youtube_channel_id", value: "",                          label: "YouTube Channel ID", group: "youtube", type: "text" },
    // Join Us
    { key: "join_us_text",     value: "Your paragraph lorem ipsum the warmth and charm of a cosy service — join us online wherever you are.", label: "Join Us Text", group: "homepage", type: "textarea" },
    { key: "visit_us_text",    value: "Your paragraph lorem ipsum the warmth and charm of a cosy service — we'd love to see you in person this Sunday.", label: "Visit Us Text", group: "homepage", type: "textarea" },
    // Pray
    { key: "pray_heading",     value: "Pray with us",                label: "Pray Heading",       group: "homepage", type: "text" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // ── Calendar sample events ──
  const now = new Date();
  await prisma.calendarEvent.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-cal-1", title: "Sunday Service",    date: new Date(now.getFullYear(), now.getMonth(), 1), time: "9:00 AM" },
      { id: "seed-cal-2", title: "Prayer Meeting",     date: new Date(now.getFullYear(), now.getMonth(), 7), time: "6:00 PM" },
      { id: "seed-cal-3", title: "Youth Night",        date: new Date(now.getFullYear(), now.getMonth(), 14), time: "5:00 PM" },
      { id: "seed-cal-4", title: "Annual Day",         date: new Date(now.getFullYear(), now.getMonth(), 28), time: "10:00 AM", description: "Church anniversary celebrations." },
    ],
  });

  console.log("✅  Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
