// app/api/admin/prayers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const s = await auth();
  if (!s?.user) return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp       = req.nextUrl.searchParams;
  const page     = Math.max(1, parseInt(sp.get("page") ?? "1"));
  const limit    = Math.min(50, parseInt(sp.get("limit") ?? "20"));
  const search   = sp.get("search") ?? "";
  const filter   = sp.get("filter") ?? "ALL";  // ALL | NAMED | ANONYMOUS
  const unread   = sp.get("unread") === "true";
  const archived = sp.get("archived") === "true";

  const where = {
    ...(filter === "ANONYMOUS" ? { anonymous: true }  : {}),
    ...(filter === "NAMED"     ? { anonymous: false } : {}),
    ...(unread   ? { read: false }     : {}),
    ...(archived ? { archived: true }  : { archived: false }),
    ...(search ? {
      OR: [
        { prayerRequest: { contains: search, mode: "insensitive" as const } },
        { name:          { contains: search, mode: "insensitive" as const } },
        { email:         { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [items, total, unreadCount] = await Promise.all([
    prisma.prayerRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.prayerRequest.count({ where }),
    prisma.prayerRequest.count({ where: { read: false, archived: false } }),
  ]);

  return NextResponse.json({ items, total, page, limit, unreadCount });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (Array.isArray(body.ids)) {
    const { ids, action } = body as { ids: string[]; action: string };
    const data =
      action === "read"      ? { read: true }      :
      action === "unread"    ? { read: false }     :
      action === "archive"   ? { archived: true }  :
      action === "unarchive" ? { archived: false } : null;
    if (!data) return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    await prisma.prayerRequest.updateMany({ where: { id: { in: ids } }, data });
    return NextResponse.json({ ok: true });
  }

  const { id, ...data } = body;
  const updated = await prisma.prayerRequest.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (Array.isArray(body.ids)) {
    await prisma.prayerRequest.deleteMany({ where: { id: { in: body.ids } } });
    return NextResponse.json({ ok: true });
  }
  await prisma.prayerRequest.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
