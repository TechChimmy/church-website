import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityCreateDoc, sanityDeleteDoc, sanityPatchDoc } from "@/lib/sanity-mutations";
import { sanityFetch } from "@/lib/sanity/fetch";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  return Boolean((await auth())?.user);
}

// Preserve admin UI request/response contracts.
// Admin Calendar expects:
// - GET returns array of objects with `id` and fields: title, description?, date, time?, endTime?, color?
// - POST accepts body containing those fields (date as string)
// - PATCH accepts { id, ...fields }
// - DELETE accepts { id }
// Sanity document `event` defines: title, description, date, endDate, time, location, imageUrl, active, featured.
// Any extra fields from the admin UI should be ignored by Sanity.

export async function GET() {
  try {
    const q = `*[_type == "event"]| order(date asc){
      _id,
      title,
      description,
      date,
      active
    }`;

    const events = await sanityFetch<any[]>(q);

    return NextResponse.json(
      events.map((ev) => ({
        id: ev._id,
        title: ev.title ?? "",
        description: ev.description ?? undefined,
        date: ev.date,
      }))
    );
  } catch (error) {
    console.error("GET /api/cms/calendar error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    if (!data.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
    if (!data.date) return NextResponse.json({ error: "Date required" }, { status: 400 });

    const created = await sanityCreateDoc({
      type: "event",
      data: {
        title: data.title.trim(),
        description: typeof data.description === "string" ? data.description : "",
        date: new Date(data.date).toISOString(),
        active: data.active !== false,
      },
    });

    revalidatePath("/");
    revalidatePath("/events");

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/calendar error:", error);
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await sanityPatchDoc({
      id,
      type: "event",
      patch: {
        set: {
          title: typeof data.title === "string" ? data.title.trim() : undefined,
          description: typeof data.description === "string" ? data.description : undefined,
          date: data.date ? new Date(data.date).toISOString() : undefined,
          active: typeof data.active === "boolean" ? data.active : undefined,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/events");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/cms/calendar error:", error);
    return NextResponse.json({ error: "Failed to update calendar event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await sanityDeleteDoc(id);

    revalidatePath("/");
    revalidatePath("/events");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/cms/calendar error:", error);
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 });
  }
}
