// app/api/cms/events/route.ts — single source of truth for all event consumers
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() { return (await auth())?.user ?? null; }

// Public + Admin: GET events
// ?active=true → only active (used by frontend calendar, homepage, events page)
// no param      → all events (used by admin panel)
export async function GET(req: NextRequest) {
  try {
    const activeOnly = req.nextUrl.searchParams.get("active") === "true";
    const events = await prisma.event.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { date: "asc" },
    });
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET /api/cms/events error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    if (!data.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!data.date) return NextResponse.json({ error: "Date required" }, { status: 400 });
    const ev = await prisma.event.create({
      data: {
        title:       data.title.trim(),
        description: data.description?.trim() ?? "",
        date:        new Date(data.date),
        endDate:     data.endDate ? new Date(data.endDate) : null,
        time:        data.time?.trim() || null,
        location:    data.location?.trim() || null,
        imageUrl:    data.imageUrl?.trim() || null,
        featured:    Boolean(data.featured),
        active:      data.active !== false,
      },
    });
    revalidatePath("/");
    revalidatePath("/events");
    return NextResponse.json(ev, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (data.date) data.date = new Date(data.date);
    if (data.endDate) data.endDate = new Date(data.endDate);
    const ev = await prisma.event.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath("/events");
    return NextResponse.json(ev);
  } catch (err) {
    console.error("PATCH /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.event.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/events");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
