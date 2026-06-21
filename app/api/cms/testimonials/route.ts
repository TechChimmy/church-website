// app/api/cms/testimonials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { return (await auth())?.user ?? null; }

export async function GET() {
  try {
    const items = await prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/cms/testimonials error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const item = await prisma.testimonial.create({ data });
    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/cms/testimonials error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, ...data } = await req.json();
    const item = await prisma.testimonial.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (error) {
    console.error("PATCH /api/cms/testimonials error:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/testimonials error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
