// app/api/cms/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/supabase-storage";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { return (await auth())?.user ?? null; }

export async function GET() {
  try {
    const items = await prisma.mediaItem.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/cms/media error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { dataUri, filename, folder } = await req.json();

    if (!dataUri) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const result = await uploadImage(dataUri, folder ?? "general");

    const item = await prisma.mediaItem.create({
      data: {
        filename: filename || result.path.split("/").pop()!,
        url:      result.url,
        path:     result.path,
        size:     result.size,
        mimeType: result.mimeType,
        folder:   folder ?? "general",
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/cms/media error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const item = await prisma.mediaItem.findUnique({ where: { id } });
    if (item) {
      await deleteImage(item.path);
      await prisma.mediaItem.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/media error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
