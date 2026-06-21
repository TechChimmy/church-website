// app/api/ask-collins/route.ts  — public form submission
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAskCollinsQuestion } from "@/lib/telegram";

// Logs the underlying DB error with as much detail as is safely available.
// Uses duck-typing rather than `instanceof Prisma.PrismaClientKnownRequestError`
// so it works the same regardless of exact Prisma client error class shape.
function logDbError(prefix: string, err: unknown) {
  if (err && typeof err === "object") {
    const code = "code" in err ? (err as { code?: unknown }).code : undefined;
    const message = "message" in err ? (err as { message?: unknown }).message : err;
    console.error(prefix, code ? `[${code}]` : "", message);
    return;
  }
  console.error(prefix, err);
}

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
    status: "PENDING" as const,
  };

  try {
    await prisma.collinsQuestion.create({ data: createData });
  } catch (err: unknown) {
    // Log the real reason (Prisma error code + message where available) so
    // the actual cause — e.g. DB unreachable, pooler/connection issue — is
    // visible in server logs even though the public response stays generic.
    logDbError("[AskCollins] DB error:", err);

    // One retry for transient connection drops (e.g. a pooled/serverless
    // connection that needs to re-establish) before giving up. This does
    // not change behavior on success and does not mask genuine failures.
    try {
      await prisma.collinsQuestion.create({ data: createData });
    } catch (retryErr: unknown) {
      logDbError("[AskCollins] DB retry failed:", retryErr);
      return NextResponse.json({ error: "Could not save question." }, { status: 500 });
    }
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
