// app/api/ask-collins/route.ts  — public form submission
import { NextRequest, NextResponse } from "next/server";
import { sanityCreateDoc } from "@/lib/sanity-mutations";
import { sendAskCollinsQuestion } from "@/lib/telegram";

const rateMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const max = 5;
  const hits = (rateMap.get(ip) ?? []).filter((t) => now - t < window);
  hits.push(now);
  rateMap.set(ip, hits);
  return hits.length > max;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { name, phone, email, question, consent, videoName, timestamp, source } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Name is required (min 2 characters)." }, { status: 400 });
  }
  if (typeof phone !== "string" || phone.trim().length < 5) {
    return NextResponse.json({ error: "Phone number is required (min 5 digits)." }, { status: 400 });
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (typeof question !== "string" || question.trim().length < 5) {
    return NextResponse.json({ error: "Question is required (min 5 characters)." }, { status: 400 });
  }
  if (question.trim().length > 2000) {
    return NextResponse.json({ error: "Question is too long (max 2000 characters)." }, { status: 400 });
  }

  // If NOT submitted from Join Us Live, consent is required.
  const isJoinLive = source === "join-us-live";
  if (!isJoinLive && !consent) {
    return NextResponse.json({ error: "You must consent to public review to submit." }, { status: 400 });
  }

  // If timestamp is provided, validate format
  if (isJoinLive && timestamp && typeof timestamp === "string" && timestamp.trim()) {
    if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp.trim())) {
      return NextResponse.json({ error: "Please enter timestamp in format MM:SS or HH:MM:SS (e.g. 12:31 or 01:15:40)." }, { status: 400 });
    }
  }

  const createData = {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    question: question.trim(),
    consent: Boolean(consent),
    videoName: isJoinLive && typeof videoName === "string" ? videoName.trim() : null,
    timestamp: isJoinLive && typeof timestamp === "string" ? timestamp.trim() : null,
    status: "PENDING",
    read: false,
    archived: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await sanityCreateDoc({
      type: "askCollins",
      data: createData,
    });
  } catch (err: unknown) {
    console.error("[AskCollins] Sanity error:", err);
    return NextResponse.json({ error: "Could not save question." }, { status: 500 });
  }

  // Fire Telegram notification — don't await to avoid blocking response
  sendAskCollinsQuestion({
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    question: question.trim(),
    consent: isJoinLive ? undefined : Boolean(consent),
    videoName: isJoinLive && typeof videoName === "string" ? videoName.trim() : undefined,
    timestamp: isJoinLive && typeof timestamp === "string" ? timestamp.trim() : undefined,
  }).catch((err) => console.error("[AskCollins] Telegram error:", err));

  return NextResponse.json({ success: true });
}

