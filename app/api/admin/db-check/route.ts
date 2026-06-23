// app/api/admin/db-check/route.ts
// Admin-only diagnostic: checks that all required Sanity schemas exist and are accessible.
// Hit GET /api/admin/db-check while logged in to diagnose CMS issues.
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/sanity/lib/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, string> = {};
  const client = getSanityClient();

  const checks: Array<{ name: string; fn: () => Promise<unknown> }> = [
    { name: "askCollins",        fn: () => client.fetch("count(*[_type == 'askCollins'])") },
    { name: "prayerRequest",     fn: () => client.fetch("count(*[_type == 'prayerRequest'])") },
    { name: "service",           fn: () => client.fetch("count(*[_type == 'service'])") },
    { name: "event",             fn: () => client.fetch("count(*[_type == 'event'])") },
    { name: "calendarEvent",     fn: () => client.fetch("count(*[_type == 'calendarEvent'])") },
    { name: "heroSlide",         fn: () => client.fetch("count(*[_type == 'heroSlide'])") },
    { name: "siteSetting",       fn: () => client.fetch("count(*[_type == 'siteSetting'])") },
    { name: "community",         fn: () => client.fetch("count(*[_type == 'community'])") },
    { name: "contactMessage",    fn: () => client.fetch("count(*[_type == 'contactMessage'])") },
    { name: "eventParticipation", fn: () => client.fetch("count(*[_type == 'eventParticipation'])") },
    { name: "footer",            fn: () => client.fetch("count(*[_type == 'footer'])") },
    { name: "announcement",      fn: () => client.fetch("count(*[_type == 'announcement'])") },
    { name: "adminUser",         fn: () => client.fetch("count(*[_type == 'adminUser'])") },
    { name: "sanity.imageAsset",  fn: () => client.fetch("count(*[_type == 'sanity.imageAsset'])") },
  ];

  for (const check of checks) {
    try {
      const count = await check.fn();
      results[check.name] = `OK (${count} documents)`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results[check.name] = `ERROR: ${msg.slice(0, 120)}`;
    }
  }

  const allOk = Object.values(results).every(v => v.startsWith("OK"));

  return NextResponse.json({
    status: allOk ? "ALL_OK" : "ERRORS_FOUND",
    message: allOk
      ? "All Sanity schemas are accessible."
      : "Some schemas are missing or inaccessible in Sanity.",
    documents: results,
  });
}

