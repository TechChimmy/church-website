import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityCreateDoc, sanityDeleteDoc, sanityPatchDoc } from "@/lib/sanity-mutations";
import { sanityFetch } from "@/lib/sanity/fetch";
import { getSanityClient } from "@/lib/sanity/client";
import { revalidatePath, revalidateTag } from "next/cache";

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

export async function GET(req: NextRequest) {
  try {
    const activeOnly = req.nextUrl.searchParams.get("active") === "true";
    const q = `*[_type == "weStayActive"${activeOnly ? " && active == true" : ""}]| order(order asc){
      _id,
      title,
      titleTa,
      description,
      descriptionTa,
      "imageUrl": image.asset->url,
      order,
      active
    }`;
    let items = await sanityFetch<any[]>(q, {}, [], false);

    if (items.length === 0) {
      const client = getSanityClient();
      const count = await client.fetch<number>(`count(*[_type == "weStayActive"])`);
      if (count === 0) {
        console.log("[api/cms/we-stay-active] Seeding default activity cards into Sanity...");
        await Promise.all([
          client.createOrReplace({
            _id: "we-stay-active-fellowship-groups",
            _type: "weStayActive",
            title: "Fellowship Groups",
            titleTa: "ஐக்கியக் குழுக்கள்",
            description: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. It's a place where time slows down and every moment is savoured like a cherished memory.",
            descriptionTa: "உங்கள் பத்தி லோரெம் இப்சம் ஒரு வசதியான, வெயில் நிறைந்த மதிய நேரத்தின் வெப்பம் மற்றும் கவர்ச்சியானது ஒரு விசித்திரமான கிராமப்புற குடிசையில் கழிக்கப்பட்டது. நெருப்பிடம் மென்மையான விரிசல் மற்றும் புதிதாக காய்ச்சப்பட்ட தேநீரின் வாசனை புலன்களை சூழ்ந்து, தூய்மையான திருப்தியான சூழ்நிலையை உருவாக்குகிறது. வெளியே, ஒரு மென்மையான காற்று இலைகள் வழியாக சலசலக்கிறது, பூக்கும் பூக்களின் இனிமையான வாசனையை சுமந்து செல்கிறது. இது நேரம் மெதுவாகக் குறையும் இடமாகும், மேலும் ஒவ்வொரு கணமும் ஒரு போற்றத்தக்க நினைவகமாக ரசிக்கப்படுகிறது.",
            order: 0,
            active: true
          }),
          client.createOrReplace({
            _id: "we-stay-active-church-retreat",
            _type: "weStayActive",
            title: "Church Retreat",
            titleTa: "திருச்சபை முகாம்",
            description: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. It's a place where time slows down and every moment is savoured like a cherished memory.",
            descriptionTa: "உங்கள் பத்தி லோரெம் இப்சம் ஒரு வசதியான, வெயில் நிறைந்த மதிய நேரத்தின் வெப்பம் மற்றும் கவர்ச்சியானது ஒரு விசித்திரமான கிராமப்புற குடிசையில் கழிக்கப்பட்டது. நெருப்பிடம் மென்மையான விரிசல் மற்றும் புதிதாக காய்ச்சப்பட்ட தேநீரின் வாசனை புலன்களை சூழ்ந்து, தூய்மையான திருப்தியான சூழ்நிலையை உருவாக்குகிறது. வெளியே, ஒரு மென்மையான காற்று இலைகள் வழியாக சலசலக்கிறது, பூக்கும் பூக்களின் இனிமையான வாசனையை சுமந்து செல்கிறது. இது நேரம் மெதுவாகக் குறையும் இடமாகும், மேலும் ஒவ்வொரு கணமும் ஒரு போற்றத்தக்க நினைவகமாக ரசிக்கப்படுகிறது.",
            order: 1,
            active: true
          }),
          client.createOrReplace({
            _id: "we-stay-active-evangelical-sunday",
            _type: "weStayActive",
            title: "Evangelical Sunday",
            titleTa: "சுவிசேஷ ஞாயிறு",
            description: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. It's a place where time slows down and every moment is savoured like a cherished memory.",
            descriptionTa: "உங்கள் பத்தி லோரெம் இப்சம் ஒரு வசதியான, வெயில் நிறைந்த மதிய நேரத்தின் வெப்பம் மற்றும் கவர்ச்சியானது ஒரு விசித்திரமான கிராமப்புற குடிசையில் கழிக்கப்பட்டது. நெருப்பிடம் மென்மையான விரிசல் மற்றும் புதிதாக காய்ச்சப்பட்ட தேநீரின் வாசனை புலன்களை சூழ்ந்து, தூய்மையான திருப்தியான சூழ்நிலையை உருவாக்குகிறது. வெளியே, ஒரு மென்மையான காற்று இலைகள் வழியாக சலசலக்கிறது, பூக்கும் பூக்களின் இனிமையான வாசனையை சுமந்து செல்கிறது. இது நேரம் மெதுவாகக் குறையும் இடமாகும், மேலும் ஒவ்வொரு கணமும் ஒரு போற்றத்தக்க நினைவகமாக ரசிக்கப்படுகிறது.",
            order: 2,
            active: true
          })
        ]);
        items = await client.fetch<any[]>(q);
      }
    }

    return NextResponse.json(
      items.map((it) => ({
        id: it._id,
        title: it.title ?? "",
        titleTa: it.titleTa ?? "",
        description: it.description ?? "",
        descriptionTa: it.descriptionTa ?? "",
        imageUrl: it.imageUrl ?? null,
        order: it.order ?? 0,
        active: it.active ?? true,
      })),
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/cms/we-stay-active error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const assetRef = getSanityAssetRef(data.imageUrl);
    const imageField = assetRef ? {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef
      }
    } : null;

    const created = await sanityCreateDoc({
      type: "weStayActive",
      data: {
        title: data.title.trim(),
        titleTa: data.titleTa?.trim() ?? "",
        description: data.description?.trim() ?? "",
        descriptionTa: data.descriptionTa?.trim() ?? "",
        image: imageField,
        order: data.order !== undefined ? Number(data.order) : 0,
        active: data.active !== false,
      },
    });

    revalidatePath("/events");
    (revalidateTag as any)("sanity");
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/we-stay-active error:", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
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
      type: "weStayActive",
      patch: {
        set: {
          title: data.title?.trim() ?? undefined,
          titleTa: data.titleTa?.trim() ?? undefined,
          description: data.description?.trim() ?? undefined,
          descriptionTa: data.descriptionTa?.trim() ?? undefined,
          image: imageField !== null ? imageField : undefined,
          order: data.order !== undefined ? Number(data.order) : undefined,
          active: typeof data.active === "boolean" ? data.active : undefined,
        },
      },
    });

    revalidatePath("/events");
    (revalidateTag as any)("sanity");
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/cms/we-stay-active error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await sanityDeleteDoc(id);

    revalidatePath("/events");
    (revalidateTag as any)("sanity");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/we-stay-active error:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
