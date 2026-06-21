// app/api/cms/calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { return (await auth())?.user ?? null; }

export async function GET() {
  try {
    const events = await prisma.calendarEvent.findMany({ orderBy: { date: "asc" } });
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/cms/calendar error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const ev = await prisma.calendarEvent.create({ data: { ...data, date: new Date(data.date) } });
    return NextResponse.json(ev);
  } catch (error) {
    console.error("POST /api/cms/calendar error:", error);
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, ...data } = await req.json();
    if (data.date) data.date = new Date(data.date);
    const ev = await prisma.calendarEvent.update({ where: { id }, data });
    return NextResponse.json(ev);
  } catch (error) {
    console.error("PATCH /api/cms/calendar error:", error);
    return NextResponse.json({ error: "Failed to update calendar event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/calendar error:", error);
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 });
  }
}
