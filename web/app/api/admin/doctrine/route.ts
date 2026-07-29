import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/lib/sanity/client";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const s = await auth();
  return !!s?.user;
}

// GET — list all doctrine items ordered by order asc
export async function GET() {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = getSanityClient();
  const items = await client.fetch(
    `*[_type == "doctrineItem"] | order(order asc) {
      _id, title, titleTa, description, descriptionTa,
      "imageUrl": image.asset->url,
      order, active
    }`,
    {}, { cache: "no-store" }
  );
  return NextResponse.json(items);
}

// POST — create new doctrine item
export async function POST(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const client = getSanityClient();
  const doc = await client.create({
    _type: "doctrineItem",
    title:         body.title ?? "New Item",
    titleTa:       body.titleTa ?? "",
    description:   body.description ?? "",
    descriptionTa: body.descriptionTa ?? "",
    order:         body.order ?? 0,
    active:        body.active ?? true,
  });
  return NextResponse.json(doc);
}

// PATCH — update fields on a doctrine item
export async function PATCH(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const client = getSanityClient();
  // Remove imageUrl (read-only) before patching
  const { imageUrl: _url, ...patchFields } = fields;
  const updated = await client.patch(id).set(patchFields).commit();
  return NextResponse.json(updated);
}

// DELETE — remove a doctrine item
export async function DELETE(req: NextRequest) {
  if (!(await requireAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const client = getSanityClient();
  await client.delete(id);
  return NextResponse.json({ success: true });
}
