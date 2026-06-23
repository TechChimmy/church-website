// app/api/cms/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/sanity/lib/client";

async function requireAdmin() {
  return (await auth())?.user ?? null;
}

export async function GET() {
  try {
    const client = getSanityClient();
    const q = `*[_type == "sanity.imageAsset"] | order(_createdAt desc) {
      _id,
      originalFilename,
      url,
      metadata {
        dimensions {
          width,
          height
        }
      },
      size,
      mimeType,
      folder,
      _createdAt
    }`;
    const items: any[] = await client.fetch(q);

    const mapped = items.map((it) => ({
      id: it._id,
      filename: it.originalFilename ?? "image",
      url: it.url ?? "",
      path: it._id,
      size: it.size ?? null,
      width: it.metadata?.dimensions?.width ?? null,
      height: it.metadata?.dimensions?.height ?? null,
      folder: it.folder ?? "general",
      createdAt: it._createdAt,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/cms/media error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { dataUri, filename, folder } = await req.json();

    if (!dataUri) return NextResponse.json({ error: "Missing image data" }, { status: 400 });

    const client = getSanityClient();
    const base64Data = dataUri.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const asset = await client.assets.upload("image", buffer, {
      filename: filename || "image.jpg",
    });

    // Save custom folder field on the asset document
    await client.patch(asset._id).set({ folder: folder || "general" }).commit();

    return NextResponse.json({
      id: asset._id,
      filename: filename || "image.jpg",
      url: asset.url,
      path: asset._id,
      size: asset.size,
      mimeType: asset.mimeType,
      width: asset.metadata?.dimensions?.width,
      height: asset.metadata?.dimensions?.height,
      folder: folder || "general",
      createdAt: asset._createdAt || new Date().toISOString(),
    });
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
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const client = getSanityClient();
    await client.delete(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/media error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}


