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

  const { name, email, question, consent, anonymous } = body as Record<string, unknown>;

  const isAnonymous = Boolean(anonymous);

  // For non-anonymous, require name and valid email
  if (!isAnonymous) {
    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
  }

  if (typeof question !== "string" || question.trim().length < 5) {
    return NextResponse.json({ error: "Question is required (min 5 chars)." }, { status: 400 });
  }
  if (question.trim().length > 2000) {
    return NextResponse.json({ error: "Question is too long (max 2000 chars)." }, { status: 400 });
  }

  const safeName = isAnonymous ? "Anonymous" : (typeof name === "string" ? name.trim() : "Anonymous");
  const safeEmail = isAnonymous ? null : (typeof email === "string" ? email.trim().toLowerCase() : null);

  const createData = {
    name: safeName,
    email: safeEmail,
    question: question.trim(),
    consent: isAnonymous ? false : Boolean(consent),
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
    name: safeName,
    email: safeEmail ?? "",
    question: question.trim(),
    anonymous: isAnonymous,
  }).catch((err) => console.error("[AskCollins] Telegram error:", err));

  return NextResponse.json({ success: true });
}

