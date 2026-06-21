// app/api/event-participation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    participation = await prisma.eventParticipation.create({
      data: {
        eventId:    eventId.trim(),
        eventTitle: typeof eventTitle === "string" ? eventTitle.trim() : "",
        name:       name.trim(),
        email:      email.trim().toLowerCase(),
        phone:      typeof phone === "string" && phone.trim() ? phone.trim() : null,
      },
    });
    console.log(`[EventParticipation] Saved: ${participation.name} for "${participation.eventTitle}"`);
  } catch (err) {
    console.error("[EventParticipation] DB error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("P2021") || msg.includes("does not exist")) {
      console.error("[EventParticipation] Table missing — run: npx prisma db push");
    }
    if (msg.includes("P2003") || msg.includes("foreign key")) {
      console.error("[EventParticipation] Event ID not found in Event table:", eventId);
    }
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
