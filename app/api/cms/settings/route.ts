// app/api/cms/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({ orderBy: [{ group: "asc" }, { label: "asc" }] });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/cms/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { key, value } = await req.json();
    const updated = await prisma.siteSetting.update({ where: { key }, data: { value } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/cms/settings error:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
