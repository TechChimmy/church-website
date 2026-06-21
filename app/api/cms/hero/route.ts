// app/api/cms/hero/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { return (await auth())?.user ?? null; }

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(slides);
  } catch (error) {
    console.error("GET /api/cms/hero error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const slide = await prisma.heroSlide.create({ data });
    return NextResponse.json(slide);
  } catch (error) {
    console.error("POST /api/cms/hero error:", error);
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, ...data } = await req.json();
    const slide = await prisma.heroSlide.update({ where: { id }, data });
    return NextResponse.json(slide);
  } catch (error) {
    console.error("PATCH /api/cms/hero error:", error);
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/hero error:", error);
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
  }
}
