// app/api/cms/service-times/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanityFetch } from "@/sanity/lib/sanity";
import { sanityCreateDoc, sanityPatchDoc, sanityDeleteDoc } from "@/lib/sanity-mutations";

async function requireAdmin() { return (await auth())?.user ?? null; }

export async function GET() {
  try {
    const items = await sanityFetch<any[]>(
      `*[_type == "service"] | order(order asc) {
        _id,
        name,
        day,
        time,
        order,
        active
      }`
    );
    const mapped = items.map((st) => ({
      id: st._id,
      title: st.name,
      day: st.day,
      time: st.time,
      order: st.order,
      active: st.active ?? true,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/cms/service-times error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await req.json();
    const result = await sanityCreateDoc({
      type: "service",
      data: {
        name: data.title,
        day: data.day,
        time: data.time,
        order: data.order ?? 0,
        active: data.active ?? true,
      },
    });
    
    const createdId = result.results?.[0]?.id;
    const item = {
      id: createdId,
      title: data.title,
      day: data.day,
      time: data.time,
      order: data.order ?? 0,
      active: data.active ?? true,
    };

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/join-us-live");
    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/cms/service-times error:", error);
    return NextResponse.json({ error: "Failed to create service time" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, ...data } = await req.json();
    await sanityPatchDoc({
      id,
      type: "service",
      patch: {
        set: {
          name: data.title,
          day: data.day,
          time: data.time,
          order: data.order ?? 0,
          active: data.active ?? true,
        },
      },
    });

    const item = {
      id,
      title: data.title,
      day: data.day,
      time: data.time,
      order: data.order ?? 0,
      active: data.active ?? true,
    };

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/join-us-live");
    return NextResponse.json(item);
  } catch (error) {
    console.error("PATCH /api/cms/service-times error:", error);
    return NextResponse.json({ error: "Failed to update service time" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    await sanityDeleteDoc(id);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/join-us-live");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/service-times error:", error);
    return NextResponse.json({ error: "Failed to delete service time" }, { status: 500 });
  }
}

