// app/api/contact-message/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactMessage } from "@/lib/telegram";

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

  const { name, email, message } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2)
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  if (typeof message !== "string" || message.trim().length < 5)
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  if (message.trim().length > 3000)
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });

  try {
    await prisma.contactMessage.create({
      data: {
        name:    name.trim(),
        email:   email.trim().toLowerCase(),
        message: message.trim(),
      },
    });
    console.log("[ContactMessage] Saved successfully");
  } catch (err) {
    console.error("[ContactMessage] DB error:", err);
    return NextResponse.json({ error: "Could not save message." }, { status: 500 });
  }

  sendContactMessage({
    name:    name.trim(),
    email:   email.trim().toLowerCase(),
    message: message.trim(),
  }).catch(err => console.error("[ContactMessage] Telegram error:", err));

  return NextResponse.json({ success: true });
}
