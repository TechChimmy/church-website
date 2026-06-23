// app/api/admin/participations/route.ts — admin only
import { NextRequest, NextResponse } from "next/server";
import { getSanityClient } from "@/sanity/lib/client";
import { auth } from "@/lib/auth";

async function requireAuth() {
  const session = await auth();
  return !!session?.user;
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = getSanityClient();
  const items = await client.fetch(
    `*[_type == "eventParticipation"] | order(createdAt desc) {
      _id,
      eventId,
      eventTitle,
      name,
      email,
      phone,
      createdAt
    }`
  );
  const mapped = items.map((it: any) => ({
    id: it._id,
    eventId: it.eventId,
    eventTitle: it.eventTitle,
    name: it.name,
    email: it.email,
    phone: it.phone,
    createdAt: it.createdAt,
  }));
  return NextResponse.json(mapped);
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  const client = getSanityClient();
  await client.delete(id);
  return NextResponse.json({ success: true });
}

