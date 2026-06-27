// app/api/admin/prayers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/lib/sanity/client";

async function requireAuth() {
  const s = await auth();
  if (!s?.user) return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const sp       = req.nextUrl.searchParams;
    const page     = Math.max(1, parseInt(sp.get("page") ?? "1"));
    const limit    = Math.min(50, parseInt(sp.get("limit") ?? "20"));
    const search   = sp.get("search") ?? "";
    const filter   = sp.get("filter") ?? "ALL";  // ALL | NAMED | ANONYMOUS
    const unreadOnly = sp.get("unread") === "true";
    const archived = sp.get("archived") === "true";

    const client = getSanityClient();

    let filterExpr = `[_type == "prayerRequest"`;
    if (filter === "ANONYMOUS") filterExpr += ` && anonymous == true`;
    if (filter === "NAMED") filterExpr += ` && anonymous == false`;
    if (unreadOnly) filterExpr += ` && read == false`;
    if (archived) {
      filterExpr += ` && archived == true`;
    } else {
      filterExpr += ` && archived == false`;
    }
    if (search) {
      filterExpr += ` && (name match $search || email match $search || prayerRequest match $search)`;
    }
    filterExpr += `]`;

    const skip = (page - 1) * limit;
    const qItems = `*${filterExpr} | order(createdAt desc) [${skip}...${skip + limit}] {
      _id,
      name,
      email,
      prayerRequest,
      anonymous,
      read,
      archived,
      approved,
      createdAt
    }`;
    const qTotal = `count(*${filterExpr})`;
    const qUnread = `count(*[_type == "prayerRequest" && read == false && archived == false])`;

    const params: Record<string, any> = {};
    if (search) params.search = `${search}*`;

    const [items, total, unreadCount] = await Promise.all([
      client.fetch<any[]>(qItems, params),
      client.fetch<number>(qTotal, params),
      client.fetch<number>(qUnread),
    ]);

    const mapped = items.map((p) => ({
      id: p._id,
      name: p.name ?? null,
      email: p.email ?? null,
      prayerRequest: p.prayerRequest ?? "",
      anonymous: p.anonymous ?? false,
      read: p.read ?? false,
      archived: p.archived ?? false,
      approved: p.approved ?? false,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ items: mapped, total, page, limit, unreadCount });
  } catch (error) {
    console.error("GET /api/admin/prayers error:", error);
    return NextResponse.json({ items: [], total: 0, page: 1, limit: 20, unreadCount: 0 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const client = getSanityClient();

    if (Array.isArray(body.ids)) {
      const { ids, action } = body as { ids: string[]; action: string };
      const data =
        action === "read"      ? { read: true }      :
        action === "unread"    ? { read: false }     :
        action === "archive"   ? { archived: true }  :
        action === "unarchive" ? { archived: false } :
        action === "approve"   ? { approved: true }  :
        action === "unapprove" ? { approved: false } : null;
      if (!data) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

      const transaction = client.transaction();
      ids.forEach((id) => {
        transaction.patch(id, (p) => p.set(data));
      });
      await transaction.commit();
      return NextResponse.json({ ok: true });
    }

    const { id, ...data } = body;
    const updated = await client.patch(id).set(data).commit();
    return NextResponse.json({
      id: updated._id,
      name: updated.name ?? null,
      email: updated.email ?? null,
      prayerRequest: updated.prayerRequest ?? "",
      anonymous: updated.anonymous ?? false,
      read: updated.read ?? false,
      archived: updated.archived ?? false,
      approved: updated.approved ?? false,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    console.error("PATCH /api/admin/prayers error:", error);
    return NextResponse.json({ error: "Failed to update prayer request" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAuth()))
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
    
    await client.delete(body.id || body.ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/prayers error:", error);
    return NextResponse.json({ error: "Failed to delete prayer request" }, { status: 500 });
  }
}

