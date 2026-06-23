// app/api/event-participation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sanityCreateDoc } from "@/lib/sanity-mutations";
import { sendEventParticipation } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const { eventId, eventTitle, name, email, phone } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  if (typeof eventId !== "string" || !eventId)
    return NextResponse.json({ error: "Event ID is required." }, { status: 400 });

  let participation;
  try {
    const data = {
      eventId:    eventId.trim(),
      eventTitle: typeof eventTitle === "string" ? eventTitle.trim() : "",
      name:       name.trim(),
      email:      email.trim().toLowerCase(),
      phone:      typeof phone === "string" && phone.trim() ? phone.trim() : null,
      createdAt:  new Date().toISOString(),
    };
    const result = await sanityCreateDoc({
      type: "eventParticipation",
      data,
    });
    
    const createdId = result.results?.[0]?.id;
    participation = {
      id: createdId,
      ...data,
    };
    console.log(`[EventParticipation] Saved: ${participation.name} for "${participation.eventTitle}"`);
  } catch (err) {
    console.error("[EventParticipation] Sanity error:", err);
    return NextResponse.json({ error: "Could not save participation." }, { status: 500 });
  }

  // Non-blocking Telegram
  sendEventParticipation({
    eventTitle: participation.eventTitle,
    name:       participation.name,
    email:      participation.email,
    phone:      participation.phone ?? undefined,
    submittedAt: participation.createdAt,
  }).catch(err => console.error("[EventParticipation] Telegram error:", err));

  return NextResponse.json({ success: true });
}

