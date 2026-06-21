// app/api/admin/db-check/route.ts
// Admin-only diagnostic: checks that all required DB tables exist and are accessible.
// Hit GET /api/admin/db-check while logged in to diagnose DB issues.
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};

  const checks: Array<{ name: string; fn: () => Promise<unknown> }> = [
    { name: "CollinsQuestion",  fn: () => prisma.collinsQuestion.count() },
    { name: "PrayerRequest",    fn: () => prisma.prayerRequest.count() },
    { name: "ServiceTime",      fn: () => prisma.serviceTime.count() },
    { name: "Event",            fn: () => prisma.event.count() },
    { name: "CalendarEvent",    fn: () => prisma.calendarEvent.count() },
    { name: "HeroSlide",        fn: () => prisma.heroSlide.count() },
    { name: "SiteSetting",      fn: () => prisma.siteSetting.count() },
    { name: "Testimonial",      fn: () => prisma.testimonial.count() },
    { name: "ContactMessage",   fn: () => prisma.contactMessage.count() },
    { name: "User",             fn: () => prisma.user.count() },
  ];

  for (const check of checks) {
    try {
      const count = await check.fn();
      results[check.name] = `OK (${count} rows)`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results[check.name] = `ERROR: ${msg.slice(0, 120)}`;
    }
  }

  const allOk = Object.values(results).every(v => v.startsWith("OK"));

  return NextResponse.json({
    status: allOk ? "ALL_OK" : "ERRORS_FOUND",
    message: allOk
      ? "All database tables are accessible."
      : "Some tables are missing or inaccessible. Run `npx prisma db push` to create them.",
    tables: results,
    fix: allOk ? null : "Run: npx prisma db push",
  });
}
