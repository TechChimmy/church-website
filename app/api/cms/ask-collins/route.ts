// app/api/cms/ask-collins/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const where = {
      ...(status !== "ALL" ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED" } : {}),
      ...(unread   ? { read: false }     : {}),
      ...(archived ? { archived: true }  : { archived: false }),
      ...(search ? {
        OR: [
          { name:     { contains: search, mode: "insensitive" as const } },
          { email:    { contains: search, mode: "insensitive" as const } },
          { question: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
    };

    const [items, total, unreadCount, pendingCount] = await Promise.all([
      prisma.collinsQuestion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.collinsQuestion.count({ where }),
      prisma.collinsQuestion.count({ where: { read: false, archived: false } }),
      prisma.collinsQuestion.count({ where: { status: "PENDING", archived: false } }),
    ]);

    return NextResponse.json({ items, total, page, limit, unreadCount, pendingCount });
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

    // Bulk: { ids, action }
    if (Array.isArray(body.ids)) {
      const { ids, action } = body as { ids: string[]; action: string };
      const data =
        action === "read"      ? { read: true }              :
        action === "unread"    ? { read: false }             :
        action === "archive"   ? { archived: true }          :
        action === "unarchive" ? { archived: false }         :
        action === "approve"   ? { status: "APPROVED" as const } :
        action === "reject"    ? { status: "REJECTED" as const } : null;
      if (!data) return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      await prisma.collinsQuestion.updateMany({ where: { id: { in: ids } }, data });
      return NextResponse.json({ ok: true });
    }

    // Single update
    const { id, ...data } = body;
    const item = await prisma.collinsQuestion.update({ where: { id }, data });
    return NextResponse.json(item);
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
    if (Array.isArray(body.ids)) {
      await prisma.collinsQuestion.deleteMany({ where: { id: { in: body.ids } } });
      return NextResponse.json({ ok: true });
    }
    await prisma.collinsQuestion.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/ask-collins error:", err);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
