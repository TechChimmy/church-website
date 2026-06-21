// app/api/cms/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
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

    const result = await uploadImage(dataUri, folder ?? "cft-church");

    const item = await prisma.mediaItem.create({
      data: {
        filename,
        url:      result.url,
        publicId: result.publicId,
        width:    result.width,
        height:   result.height,
        size:     result.bytes,
        mimeType: `image/${result.format}`,
        folder:   folder ?? "general",
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/cms/media error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const item = await prisma.mediaItem.findUnique({ where: { id } });
    if (item) {
      await deleteImage(item.publicId);
      await prisma.mediaItem.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/media error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
