// app/api/cms/ask-collins/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/lib/sanity/client";
import { fetchCollinsQuestions } from "@/lib/sanity-queries";

async function requireAdmin() {
  return (await auth())?.user ?? null;
}

// Admin: list questions with filters + pagination
export async function GET(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sp       = req.nextUrl.searchParams;
    const page     = Math.max(1, parseInt(sp.get("page") ?? "1"));
    const limit    = Math.min(50, parseInt(sp.get("limit") ?? "20"));
    const status   = sp.get("status") ?? "ALL";
    const search   = sp.get("search") ?? "";
    const unread   = sp.get("unread") === "true";
    const archived = sp.get("archived") === "true";

    const result = await fetchCollinsQuestions({
      page,
      limit,
      status: status === "ALL" ? undefined : status,
      search,
      unread: unread ? true : undefined,
      archived,
    });

    const mappedItems = result.items.map((item: any) => ({
      id: item._id,
      name: item.name ?? "",
      email: item.email ?? "",
      question: item.question ?? "",
      answer: item.answer ?? "",
      status: item.status ?? "PENDING",
      read: item.read ?? false,
      archived: item.archived ?? false,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      items: mappedItems,
      total: result.total,
      page: result.page,
      limit: result.limit,
      unreadCount: result.unreadCount,
      pendingCount: result.pendingCount,
    });
  } catch (err) {
    console.error("GET /api/cms/ask-collins error:", err);
    return NextResponse.json({ items: [], total: 0, page: 1, limit: 20, unreadCount: 0, pendingCount: 0 });
  }
}

// Admin: update status / answer / read / archive
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const client = getSanityClient();

    // Bulk: { ids, action }
    if (Array.isArray(body.ids)) {
      const { ids, action } = body as { ids: string[]; action: string };
      const data =
        action === "read"      ? { read: true }              :
        action === "unread"    ? { read: false }             :
        action === "archive"   ? { archived: true }          :
        action === "unarchive" ? { archived: false }         :
        action === "approve"   ? { status: "APPROVED" } :
        action === "reject"    ? { status: "REJECTED" } : null;
      if (!data) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

      const transaction = client.transaction();
      ids.forEach((id) => {
        transaction.patch(id, (p) => p.set(data));
      });
      await transaction.commit();
      return NextResponse.json({ ok: true });
    }

    // Single update
    const { id, ...data } = body;
    const updated = await client.patch(id).set(data).commit();
    return NextResponse.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      question: updated.question,
      answer: updated.answer,
      status: updated.status,
      read: updated.read,
      archived: updated.archived,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    console.error("PATCH /api/cms/ask-collins error:", err);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const client = getSanityClient();

    if (Array.isArray(body.ids)) {
      const transaction = client.transaction();
      body.ids.forEach((id: string) => {
        transaction.delete(id);
      });
      await transaction.commit();
      return NextResponse.json({ ok: true });
    }
    
    await client.delete(body.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/ask-collins error:", err);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}

