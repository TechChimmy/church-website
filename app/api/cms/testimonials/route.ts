// app/api/cms/testimonials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityFetch } from "@/sanity/lib/sanity";
import { sanityCreateDoc, sanityPatchDoc, sanityDeleteDoc } from "@/lib/sanity-mutations";

async function requireAdmin() { return (await auth())?.user ?? null; }

function getSanityAssetRef(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("image-")) return url;
  const cleanUrl = url.split("?")[0];
  const match = cleanUrl.match(/\/images\/[^/]+\/[^/]+\/([^/]+)$/);
  if (match && match[1]) {
    const filename = match[1];
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      const nameWithoutExt = filename.slice(0, lastDotIndex);
      const ext = filename.slice(lastDotIndex + 1);
      return `image-${nameWithoutExt}-${ext}`;
    }
  }
  return null;
}

export async function GET() {
  try {
    const items = await sanityFetch<any[]>(
      `*[_type == "community"] | order(order asc) {
        _id,
        name,
        quote,
        "imageUrl": image.asset->url,
        order,
        active
      }`
    );
    const mapped = items.map((t) => ({
      id: t._id,
      name: t.name ?? "",
      body: t.quote ?? "",
      imageUrl: t.imageUrl ?? null,
      order: t.order ?? 0,
      active: t.active ?? true,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/cms/testimonials error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();

    const assetRef = getSanityAssetRef(data.imageUrl);
    const imageField = assetRef ? {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef
      }
    } : null;

    const result = await sanityCreateDoc({
      type: "community",
      data: {
        name: data.name,
        quote: data.body,
        image: imageField,
        order: data.order ?? 0,
        active: data.active ?? true,
      },
    });

    const createdId = result.results?.[0]?.id;
    const item = {
      id: createdId,
      name: data.name,
      body: data.body,
      imageUrl: data.imageUrl ?? null,
      order: data.order ?? 0,
      active: data.active ?? true,
    };

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

    const assetRef = getSanityAssetRef(data.imageUrl);
    const imageField = assetRef ? {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef
      }
    } : null;

    await sanityPatchDoc({
      id,
      type: "community",
      patch: {
        set: {
          name: data.name,
          quote: data.body,
          image: imageField,
          order: data.order ?? 0,
          active: data.active ?? true,
        },
      },
    });

    const item = {
      id,
      name: data.name,
      body: data.body,
      imageUrl: data.imageUrl ?? null,
      order: data.order ?? 0,
      active: data.active ?? true,
    };

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
    await sanityDeleteDoc(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/testimonials error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}

