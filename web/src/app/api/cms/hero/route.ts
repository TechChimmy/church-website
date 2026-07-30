import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanityFetch } from "@/lib/sanity/fetch";
import { getSanityClient } from "@/lib/sanity/client";
import { sanityCreateDoc, sanityDeleteDoc, sanityPatchDoc } from "@/lib/sanity-mutations";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  return Boolean((await auth())?.user);
}

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
    const client = getSanityClient();
    const q = `*[_type == "heroSlide"]| order(order asc){
      _id,
      title,
      titleTa,
      subtitle,
      subtitleTa,
      description,
      descriptionTa,
      "imageUrl": image.asset->url,
      ctaText,
      ctaHref,
      order,
      active
    }`;

    let slides = await client.fetch<any[]>(q);

    if (slides.length === 0) {
      console.log("[Hero API] Seeding default hero slides into Sanity...");
      await Promise.all([
        client.create({ _type: "heroSlide", title: "Welcome Home", subtitle: "Sunday Service · 9am & 11am", order: 0, active: true }),
        client.create({ _type: "heroSlide", title: "Faith. Hope. Love.", subtitle: "Building a community rooted in Christ", order: 1, active: true }),
        client.create({ _type: "heroSlide", title: "Come as You Are", subtitle: "You are welcome here, always", order: 2, active: true }),
      ]);
      slides = await client.fetch<any[]>(q);
    }

    return NextResponse.json(
      slides.map((s) => ({
        id: s._id,
        title: s.title ?? "",
        titleTa: s.titleTa ?? "",
        subtitle: s.subtitle ?? "",
        subtitleTa: s.subtitleTa ?? "",
        description: s.description ?? "",
        descriptionTa: s.descriptionTa ?? "",
        imageUrl: s.imageUrl ?? "",
        ctaText: s.ctaText ?? (s.order === 1 ? "About Us" : s.order === 2 ? "Visit Us" : "Join Us Live"),
        ctaHref: s.ctaHref ?? (s.order === 1 ? "/about" : s.order === 2 ? "/about#visit" : "/join-us-live"),
        order: s.order ?? 0,
        active: s.active ?? true,
      }))
    );
  } catch (error) {
    console.error("GET /api/cms/hero error:", error);
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

    const docData: Record<string, any> = {
      title: data?.title ?? "",
      titleTa: data?.titleTa ?? "",
      subtitle: data?.subtitle ?? "",
      subtitleTa: data?.subtitleTa ?? "",
      description: data?.description ?? "",
      descriptionTa: data?.descriptionTa ?? "",
      ctaText: data?.ctaText ?? "",
      ctaHref: data?.ctaHref ?? "",
      order: typeof data?.order === "number" ? data.order : Number(data?.order ?? 0),
      active: data?.active ?? true,
    };

    if (imageField) {
      docData.image = imageField;
    }

    const created = await sanityCreateDoc({
      type: "heroSlide",
      data: docData,
    });

    revalidatePath("/");
    return NextResponse.json(created);
  } catch (error) {
    console.error("POST /api/cms/hero error:", error);
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...data } = body as { id?: string } & Record<string, any>;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const assetRef = getSanityAssetRef(data.imageUrl);
    const imageField = assetRef ? {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef
      }
    } : null;

    const setFields: Record<string, any> = {
      title: data?.title ?? "",
      titleTa: data?.titleTa ?? "",
      subtitle: data?.subtitle ?? "",
      subtitleTa: data?.subtitleTa ?? "",
      description: data?.description ?? "",
      descriptionTa: data?.descriptionTa ?? "",
      ctaText: data?.ctaText ?? "",
      ctaHref: data?.ctaHref ?? "",
      order: typeof data?.order === "number" ? data.order : Number(data?.order ?? 0),
      active: data?.active ?? true,
    };

    const unsetFields: string[] = [];

    if (imageField) {
      setFields.image = imageField;
    } else {
      unsetFields.push("image");
    }

    const updated = await sanityPatchDoc({
      id,
      type: "heroSlide",
      patch: {
        set: setFields,
        ...(unsetFields.length > 0 ? { unset: unsetFields } : {}),
      },
    });

    revalidatePath("/");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/cms/hero error:", error);
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await sanityDeleteDoc(id);

    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/hero error:", error);
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
  }
}

