// lib/telegram.ts — server-side only
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_GROUP_CHAT_ID;

async function sendMessage(text: string): Promise<{ ok: boolean; error?: string }> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_CHAT_ID");
    return { ok: false, error: "Missing credentials" };
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      console.error("[Telegram] sendMessage failed:", res.status, body);
      return { ok: false, error: body };
    }
    return { ok: true };
  } catch (err) {
    console.error("[Telegram] Network error:", err);
    return { ok: false, error: String(err) };
  }
}

function ts() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  });
}

export async function sendPrayerRequest(opts: {
  anonymous: boolean; name?: string; email?: string; prayerRequest: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { anonymous, name, email, prayerRequest } = opts;
  const text = anonymous
    ? `━━━━━━━━━━━━━━\n🙏 <b>ANONYMOUS PRAYER REQUEST</b>\n\n<b>Prayer Request:</b>\n${prayerRequest}\n\n<b>Submitted:</b> ${ts()}\n━━━━━━━━━━━━━━`
    : `━━━━━━━━━━━━━━\n🙏 <b>NEW PRAYER REQUEST</b>\n\n<b>Name:</b> ${name}\n\n<b>Email:</b> ${email}\n\n<b>Prayer Request:</b>\n${prayerRequest}\n\n<b>Submitted:</b> ${ts()}\n━━━━━━━━━━━━━━`;
  return sendMessage(text);
}

export async function sendAskCollinsQuestion(opts: {
  name: string; email: string; question: string; anonymous?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const text = opts.anonymous
    ? `━━━━━━━━━━━━━━\n❓ <b>ANONYMOUS ASK COLLINS QUESTION</b>\n\n<b>Question:</b>\n${opts.question}\n\n<b>Submitted:</b> ${ts()}\n━━━━━━━━━━━━━━`
    : `━━━━━━━━━━━━━━\n❓ <b>NEW ASK COLLINS QUESTION</b>\n\n<b>Name:</b> ${opts.name}\n\n<b>Email:</b> ${opts.email}\n\n<b>Question:</b>\n${opts.question}\n\n<b>Submitted:</b> ${ts()}\n━━━━━━━━━━━━━━`;
  return sendMessage(text);
}

export async function sendContactMessage(opts: {
  name: string; email: string; message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const text = `━━━━━━━━━━━━━━\n📩 <b>NEW CONTACT MESSAGE</b>\n\n<b>Name:</b> ${opts.name}\n\n<b>Email:</b> ${opts.email}\n\n<b>Message:</b>\n${opts.message}\n\n<b>Submitted:</b> ${ts()}\n━━━━━━━━━━━━━━`;
  return sendMessage(text);
}

export async function sendEventParticipation(opts: {
  eventTitle: string; name: string; email: string; phone?: string; submittedAt: Date;
}): Promise<{ ok: boolean; error?: string }> {
  const submitted = opts.submittedAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  });
  const text = `━━━━━━━━━━━━━━\n📋 <b>NEW EVENT PARTICIPATION</b>\n\n<b>Event:</b> ${opts.eventTitle}\n\n<b>Name:</b> ${opts.name}\n\n<b>Email:</b> ${opts.email}\n\n<b>Phone:</b> ${opts.phone ?? "Not provided"}\n\n<b>Submitted:</b> ${submitted}\n━━━━━━━━━━━━━━`;
  return sendMessage(text);
}
