// app/api/prayer-request/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sanityCreateDoc } from "@/lib/sanity-mutations";
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

  const { name, phone, email, prayerRequest, anonymous } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ error: "Name is required (min 2 characters)." }, { status: 400 });
  if (typeof phone !== "string" || phone.trim().length < 5)
    return NextResponse.json({ error: "Phone number is required (min 5 digits)." }, { status: 400 });
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  if (typeof prayerRequest !== "string" || prayerRequest.trim().length < 3)
    return NextResponse.json({ error: "Prayer request is required." }, { status: 400 });
  if (prayerRequest.trim().length > 2000)
    return NextResponse.json({ error: "Prayer request is too long." }, { status: 400 });

  const isAnon = Boolean(anonymous);

  try {
    await sanityCreateDoc({
      type: "prayerRequest",
      data: {
        name:          (name as string).trim(),
        phone:         (phone as string).trim(),
        email:         (email as string).trim().toLowerCase(),
        prayerRequest: (prayerRequest as string).trim(),
        anonymous:     isAnon,
        approved:      false,
        archived:      false,
        createdAt:     new Date().toISOString(),
      } as any,
    });
  } catch (err) {
    console.error("[PrayerRequest] Sanity error:", err);
    return NextResponse.json({ error: "Could not save prayer request." }, { status: 500 });
  }

  sendPrayerRequest({
    anonymous:     isAnon,
    name:          (name as string).trim(),
    phone:         (phone as string).trim(),
    email:         (email as string).trim().toLowerCase(),
    prayerRequest: (prayerRequest as string).trim(),
  }).catch(err => console.error("[PrayerRequest] Telegram error:", err));

  return NextResponse.json({ success: true });
}

