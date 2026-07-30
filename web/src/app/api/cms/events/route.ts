import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityCreateDoc, sanityDeleteDoc, sanityPatchDoc } from "@/lib/sanity-mutations";
import { sanityFetch } from "@/lib/sanity/fetch";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  return Boolean((await auth())?.user);
}

// Admin UI request/response contract:
// GET /api/cms/events?active=true (default) returns events used by admin page.
// POST accepts: { title, description, date, endDate?, time?, location?, imageUrl?, featured?, active? }
// PATCH accepts: { id, ...fields }
// DELETE accepts: { id }

export async function GET(req: NextRequest) {
  try {
    const activeOnly = req.nextUrl.searchParams.get("active") === "true";

    const q = `*[_type == "event"${activeOnly ? " && active == true" : ""}]| order(order asc, date asc){
      _id,
      title,
      titleTa,
      description,
      descriptionTa,
      date,
      endDate,
      time,
      timeTa,
      location,
      locationTa,
      imageUrl,
      featured,
      active,
      order,
    }`;

    const events = await sanityFetch<any[]>(q, {}, [], false);
    // Keep Prisma-style response fields (id vs _id)
    return NextResponse.json(
      events.map((ev) => ({
        id: ev._id,
        title: ev.title ?? "",
        titleTa: ev.titleTa ?? "",
        description: ev.description ?? "",
        descriptionTa: ev.descriptionTa ?? "",
        date: ev.date,
        endDate: ev.endDate ?? null,
        time: ev.time ?? null,
        timeTa: ev.timeTa ?? null,
        location: ev.location ?? null,
        locationTa: ev.locationTa ?? null,
        imageUrl: ev.imageUrl ?? null,
        featured: Boolean(ev.featured),
        active: ev.active ?? true,
        order: ev.order ?? 0,
      })),
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("GET /api/cms/events error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!data.date) return NextResponse.json({ error: "Date required" }, { status: 400 });

    const created = await sanityCreateDoc({
      type: "event",
      data: {
        title: data.title.trim(),
        titleTa: data.titleTa?.trim() ?? "",
        description: data.description?.trim() ?? "",
        descriptionTa: data.descriptionTa?.trim() ?? "",
        date: new Date(data.date).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        time: data.time?.trim() || null,
        timeTa: data.timeTa?.trim() || null,
        location: data.location?.trim() || null,
        locationTa: data.locationTa?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        featured: Boolean(data.featured),
        active: data.active !== false,
        order: data.order !== undefined ? Number(data.order) : 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    (revalidateTag as any)("sanity");
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...data } = body as { id?: string } & Record<string, any>;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const setFields: Record<string, any> = {};
    const unsetFields: string[] = [];

    const assignField = (key: string, val: any) => {
      if (val === undefined) return;
      if (val === null) {
        unsetFields.push(key);
      } else {
        setFields[key] = val;
      }
    };

    assignField("title", data.title?.trim() ?? undefined);
    assignField("titleTa", data.titleTa?.trim() ?? undefined);
    assignField("description", data.description?.trim() ?? undefined);
    assignField("descriptionTa", data.descriptionTa?.trim() ?? undefined);
    assignField("date", data.date ? new Date(data.date).toISOString() : undefined);
    assignField("endDate", data.endDate ? new Date(data.endDate).toISOString() : null);
    assignField("time", data.time?.trim() || null);
    assignField("timeTa", data.timeTa?.trim() || null);
    assignField("location", data.location?.trim() || null);
    assignField("locationTa", data.locationTa?.trim() || null);
    assignField("imageUrl", data.imageUrl?.trim() || null);
    assignField("featured", typeof data.featured === "boolean" ? data.featured : undefined);
    assignField("active", typeof data.active === "boolean" ? data.active : undefined);
    assignField("order", data.order !== undefined ? Number(data.order) : undefined);

    const updated = await sanityPatchDoc({
      id,
      type: "event",
      patch: {
        set: setFields,
        ...(unsetFields.length > 0 ? { unset: unsetFields } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/events");
    (revalidateTag as any)("sanity");
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await sanityDeleteDoc(id);

    revalidatePath("/");
    revalidatePath("/events");
    (revalidateTag as any)("sanity");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

