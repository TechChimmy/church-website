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
    const q = `*[_type == "answerFromTheWord"${activeOnly ? " && active == true" : ""}]| order(publishDate desc, _createdAt desc){
      _id,
      title,
      titleTa,
      question,
      questionTa,
      answer,
      answerTa,
      "imageUrl": featuredImage.asset->url,
      publishDate,
      category,
      categoryTa,
      excerpt,
      excerptTa,
      order,
      active
    }`;
    const items = await sanityFetch<any[]>(q, {}, [], false);

    return NextResponse.json(
      items.map((it) => ({
        id: it._id,
        title: it.title ?? "",
        titleTa: it.titleTa ?? "",
        question: it.question ?? "",
        questionTa: it.questionTa ?? "",
        answer: it.answer ?? "",
        answerTa: it.answerTa ?? "",
        imageUrl: it.imageUrl ?? null,
        publishDate: it.publishDate ?? null,
        category: it.category ?? "Faith",
        categoryTa: it.categoryTa ?? "",
        excerpt: it.excerpt ?? "",
        excerptTa: it.excerptTa ?? "",
        order: it.order ?? 0,
        active: it.active ?? true,
      }))
    );
  } catch (err) {
    console.error("GET /api/cms/answers error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.title?.trim() && !data.question?.trim()) {
      return NextResponse.json({ error: "Title or Question required" }, { status: 400 });
    }

    const assetRef = getSanityAssetRef(data.imageUrl);
    const imageField = assetRef ? {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef
      }
    } : null;

    const docData: Record<string, any> = {
      title: data.title?.trim() ?? "",
      titleTa: data.titleTa?.trim() ?? "",
      question: data.question?.trim() ?? data.title?.trim() ?? "",
      questionTa: data.questionTa?.trim() ?? "",
      answer: data.answer?.trim() ?? "",
      answerTa: data.answerTa?.trim() ?? "",
      publishDate: data.publishDate ? new Date(data.publishDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      category: data.category?.trim() || "Faith",
      categoryTa: data.categoryTa?.trim() ?? "",
      excerpt: data.excerpt?.trim() ?? "",
      excerptTa: data.excerptTa?.trim() ?? "",
      order: data.order !== undefined ? Number(data.order) : 0,
      active: data.active !== false,
    };

    if (imageField) {
      docData.featuredImage = imageField;
    }

    const created = await sanityCreateDoc({
      type: "answerFromTheWord",
      data: docData,
    });

    revalidatePath("/ask-collins");
    revalidatePath(`/answers/${created._id}`);
    (revalidateTag as any)("sanity");
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/answers error:", err);
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 });
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

    const setFields: Record<string, any> = {
      title: data.title?.trim() ?? undefined,
      titleTa: data.titleTa?.trim() ?? undefined,
      question: data.question?.trim() ?? undefined,
      questionTa: data.questionTa?.trim() ?? undefined,
      answer: data.answer?.trim() ?? undefined,
      answerTa: data.answerTa?.trim() ?? undefined,
      publishDate: data.publishDate ? new Date(data.publishDate).toISOString().slice(0, 10) : undefined,
      category: data.category?.trim() ?? undefined,
      categoryTa: data.categoryTa?.trim() ?? undefined,
      excerpt: data.excerpt?.trim() ?? undefined,
      excerptTa: data.excerptTa?.trim() ?? undefined,
      order: data.order !== undefined ? Number(data.order) : undefined,
      active: typeof data.active === "boolean" ? data.active : undefined,
    };

    const unsetFields: string[] = [];

    if (imageField) {
      setFields.featuredImage = imageField;
    } else if (data.imageUrl === "") {
      unsetFields.push("featuredImage");
    }

    const updated = await sanityPatchDoc({
      id,
      type: "answerFromTheWord",
      patch: {
        set: setFields,
        ...(unsetFields.length > 0 ? { unset: unsetFields } : {}),
      },
    });

    revalidatePath("/ask-collins");
    revalidatePath(`/answers/${id}`);
    (revalidateTag as any)("sanity");
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/cms/answers error:", err);
    return NextResponse.json({ error: "Failed to update answer" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await sanityDeleteDoc(id);

    revalidatePath("/ask-collins");
    revalidatePath(`/answers/${id}`);
    (revalidateTag as any)("sanity");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/answers error:", err);
    return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 });
  }
}
