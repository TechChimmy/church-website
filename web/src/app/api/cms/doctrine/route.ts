import { NextRequest, NextResponse } from "next/server";
import { sanityFetch } from "@/lib/sanity/fetch";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = `*[_type == "doctrineItem" && active == true] | order(order asc) {
      _id,
      title,
      titleTa,
      description,
      descriptionTa,
      "imageUrl": image.asset->url,
      order,
      active
    }`;

    const items = await sanityFetch<any[]>(q, {}, [], false);
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
