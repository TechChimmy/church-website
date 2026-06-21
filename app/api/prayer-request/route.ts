// app/api/prayer-request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPrayerRequest } from "@/lib/telegram";

const rateMap = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now(), window = 10 * 60 * 1000, max = 5;
  const hits = (rateMap.get(ip) ?? []).filter(t => now - t < window);
  hits.push(now); rateMap.set(ip, hits);
  return hits.length > max;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const { name, email, prayerRequest, anonymous } = body as Record<string, unknown>;

  if (typeof prayerRequest !== "string" || prayerRequest.trim().length < 3)
    return NextResponse.json({ error: "Prayer request is required." }, { status: 400 });
  if (prayerRequest.trim().length > 2000)
    return NextResponse.json({ error: "Prayer request is too long." }, { status: 400 });

  const isAnon = Boolean(anonymous);
  if (!isAnon) {
    if (typeof name !== "string" || name.trim().length < 2)
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  try {
    await prisma.prayerRequest.create({
      data: {
        name:          isAnon ? null : (name as string).trim(),
        email:         isAnon ? null : (email as string).trim().toLowerCase(),
        prayerRequest: (prayerRequest as string).trim(),
        anonymous:     isAnon,
      },
    });
    console.log("[PrayerRequest] Saved successfully");
  } catch (err) {
    console.error("[PrayerRequest] DB error:", err);
    return NextResponse.json({ error: "Could not save prayer request." }, { status: 500 });
  }

  sendPrayerRequest({
    anonymous:     isAnon,
    name:          isAnon ? undefined : (name as string).trim(),
    email:         isAnon ? undefined : (email as string).trim().toLowerCase(),
    prayerRequest: (prayerRequest as string).trim(),
  }).catch(err => console.error("[PrayerRequest] Telegram error:", err));

  return NextResponse.json({ success: true });
}
