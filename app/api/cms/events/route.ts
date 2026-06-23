import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityCreateDoc, sanityDeleteDoc, sanityPatchDoc } from "@/lib/sanity-mutations";
import { sanityFetch } from "@/sanity/lib/sanity";
import { revalidatePath } from "next/cache";

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

    const q = `*[_type == "event"${activeOnly ? " && active == true" : ""}]| order(date asc){
      _id,
      title,
      description,
      date,
      endDate,
      time,
      location,
      imageUrl,
      featured,
      active,
    }`;

    const events = await sanityFetch<any[]>(q);
    // Keep Prisma-style response fields (id vs _id)
    return NextResponse.json(
      events.map((ev) => ({
        id: ev._id,
        title: ev.title ?? "",
        description: ev.description ?? "",
        date: ev.date,
        endDate: ev.endDate ?? null,
        time: ev.time ?? null,
        location: ev.location ?? null,
        imageUrl: ev.imageUrl ?? null,
        featured: Boolean(ev.featured),
        active: ev.active ?? true,
      }))
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
        description: data.description?.trim() ?? "",
        date: new Date(data.date).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        time: data.time?.trim() || null,
        location: data.location?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        featured: Boolean(data.featured),
        active: data.active !== false,
      },
    });

    revalidatePath("/");
    revalidatePath("/events");

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

    const updated = await sanityPatchDoc({
      id,
      type: "event",
      patch: {
        set: {
          title: data.title?.trim() ?? undefined,
          description: data.description?.trim() ?? undefined,
          date: data.date ? new Date(data.date).toISOString() : undefined,
          endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
          time: data.time?.trim() || null,
          location: data.location?.trim() || null,
          imageUrl: data.imageUrl?.trim() || null,
          featured: typeof data.featured === "boolean" ? data.featured : undefined,
          active: typeof data.active === "boolean" ? data.active : undefined,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/events");

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cms/events error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

