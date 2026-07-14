import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityCreateDoc, sanityDeleteDoc, sanityPatchDoc } from "@/lib/sanity-mutations";
import { sanityFetch } from "@/lib/sanity/fetch";
import { revalidatePath, revalidateTag } from "next/cache";

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

export async function GET(req: NextRequest) {
  try {
    const activeOnly = req.nextUrl.searchParams.get("active") === "true";
    const q = `*[_type == "galleryImage"${activeOnly ? " && active == true" : ""}]| order(order asc){
      _id,
      title,
      "imageUrl": image.asset->url,
      order,
      active
    }`;
    const items = await sanityFetch<any[]>(q);

    return NextResponse.json(
      items.map((it) => ({
        id: it._id,
        title: it.title ?? "",
        imageUrl: it.imageUrl ?? null,
        order: it.order ?? 0,
        active: it.active ?? true,
      }))
    );
  } catch (err) {
    console.error("GET /api/cms/gallery error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.imageUrl) return NextResponse.json({ error: "Image is required" }, { status: 400 });

    const assetRef = getSanityAssetRef(data.imageUrl);
    const imageField = assetRef ? {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef
      }
    } : null;

    const created = await sanityCreateDoc({
      type: "galleryImage",
      data: {
        title: data.title?.trim() ?? "",
        image: imageField,
        order: data.order !== undefined ? Number(data.order) : 0,
        active: data.active !== false,
      },
    });

    revalidatePath("/");
    revalidatePath("/about");
    (revalidateTag as any)("sanity");
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/gallery error:", err);
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const updated = await sanityPatchDoc({
      id,
      type: "galleryImage",
      patch: {
        set: {
          title: data.title?.trim() ?? undefined,
          image: imageField !== null ? imageField : undefined,
          order: data.order !== undefined ? Number(data.order) : undefined,
          active: typeof data.active === "boolean" ? data.active : undefined,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/about");
    (revalidateTag as any)("sanity");
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/cms/gallery error:", err);
    return NextResponse.json({ error: "Failed to update gallery image" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await sanityDeleteDoc(id);

    revalidatePath("/");
    revalidatePath("/about");
    (revalidateTag as any)("sanity");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/gallery error:", err);
    return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 });
  }
}
