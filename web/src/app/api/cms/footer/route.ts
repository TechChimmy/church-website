// app/api/cms/footer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/lib/sanity/client";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  return Boolean((await auth())?.user);
}

const DEFAULT_FOOTER = {
  _id: "footer-global",
  _type: "footer",
  address: "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
  addressTa: "75, அண்ணா சாலை, சென்னை,\nதமிழ்நாடு 600002, இந்தியா.",
  phone: "+91 98876 54321",
  email: "info@cftchurch.com",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
};

export async function GET() {
  try {
    const client = getSanityClient();
    let footer = await client.fetch(`*[_type == "footer"][0]`);

    if (!footer) {
      console.log("[Footer API] Seeding default footer content...");
      footer = await client.createOrReplace(DEFAULT_FOOTER);
    }

    return NextResponse.json({
      address: footer.address ?? "",
      addressTa: footer.addressTa ?? "",
      phone: footer.phone ?? "",
      email: footer.email ?? "",
      mapEmbed: footer.mapEmbed ?? "",
    });
  } catch (error) {
    console.error("GET /api/cms/footer error:", error);
    return NextResponse.json(
      {
        address: DEFAULT_FOOTER.address,
        addressTa: DEFAULT_FOOTER.addressTa,
        phone: DEFAULT_FOOTER.phone,
        email: DEFAULT_FOOTER.email,
        mapEmbed: DEFAULT_FOOTER.mapEmbed,
      },
      { status: 200 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const client = getSanityClient();

    const updated = await client.createOrReplace({
      _id: "footer-global",
      _type: "footer",
      address: data.address ?? "",
      addressTa: data.addressTa ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      mapEmbed: data.mapEmbed ?? "",
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/events");
    revalidatePath("/ask-collins");
    revalidatePath("/join-us-live");

    return NextResponse.json({
      address: updated.address ?? "",
      addressTa: updated.addressTa ?? "",
      phone: updated.phone ?? "",
      email: updated.email ?? "",
      mapEmbed: updated.mapEmbed ?? "",
    });
  } catch (error) {
    console.error("PATCH /api/cms/footer error:", error);
    return NextResponse.json({ error: "Failed to update footer content" }, { status: 500 });
  }
}
