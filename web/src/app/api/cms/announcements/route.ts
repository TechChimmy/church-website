import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityCreateDoc, sanityDeleteDoc, sanityPatchDoc } from "@/lib/sanity-mutations";
import { sanityFetch } from "@/lib/sanity/fetch";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  return Boolean((await auth())?.user);
}

export async function GET(req: NextRequest) {
  try {
    const activeOnly = req.nextUrl.searchParams.get("active") === "true";
    const q = `*[_type == "announcement" && !(_id in path("drafts.**"))${activeOnly ? " && active == true" : ""}]| order(date desc){
      _id,
      title,
      titleTa,
      content,
      contentTa,
      date,
      active
    }`;
    const items = await sanityFetch<any[]>(q, {}, [], false);

    return NextResponse.json(
      items.map((it) => ({
        id: it._id,
        title: it.title ?? "",
        titleTa: it.titleTa ?? "",
        content: it.content ?? "",
        contentTa: it.contentTa ?? "",
        date: it.date ?? null,
        active: it.active ?? true,
      }))
    );
  } catch (err) {
    console.error("GET /api/cms/announcements error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const created = await sanityCreateDoc({
      type: "announcement",
      data: {
        title: data.title.trim(),
        titleTa: data.titleTa?.trim() ?? "",
        content: data.content?.trim() ?? "",
        contentTa: data.contentTa?.trim() ?? "",
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        active: data.active !== false,
      },
    });

    revalidatePath("/");
    (revalidateTag as any)("sanity");
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/announcements error:", err);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...data } = body as { id?: string } & Record<string, any>;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await sanityPatchDoc({
      id,
      type: "announcement",
      patch: {
        set: {
          title: data.title?.trim() ?? undefined,
          titleTa: data.titleTa?.trim() ?? undefined,
          content: data.content?.trim() ?? undefined,
          contentTa: data.contentTa?.trim() ?? undefined,
          date: data.date ? new Date(data.date).toISOString() : undefined,
          active: typeof data.active === "boolean" ? data.active : undefined,
        },
      },
    });

    revalidatePath("/");
    (revalidateTag as any)("sanity");
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/cms/announcements error:", err);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await sanityDeleteDoc(id);

    revalidatePath("/");
    (revalidateTag as any)("sanity");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/announcements error:", err);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
