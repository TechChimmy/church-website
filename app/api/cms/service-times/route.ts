// app/api/cms/service-times/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() { return (await auth())?.user ?? null; }

export async function GET() {
  try {
    const items = await prisma.serviceTime.findMany({ where: { active: true }, orderBy: { order: "asc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/cms/service-times error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const item = await prisma.serviceTime.create({ data });
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/join-us-live");
    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/cms/service-times error:", error);
    return NextResponse.json({ error: "Failed to create service time" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, ...data } = await req.json();
    const item = await prisma.serviceTime.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/join-us-live");
    return NextResponse.json(item);
  } catch (error) {
    console.error("PATCH /api/cms/service-times error:", error);
    return NextResponse.json({ error: "Failed to update service time" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    await prisma.serviceTime.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/join-us-live");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/service-times error:", error);
    return NextResponse.json({ error: "Failed to delete service time" }, { status: 500 });
  }
}
