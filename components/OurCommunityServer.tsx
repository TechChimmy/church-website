import { prisma } from "@/lib/prisma";
import OurCommunity from "./OurCommunity";

export default async function OurCommunityServer() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
    });

    if (testimonials.length === 0) {
      return <OurCommunity testimonials={[]} />;
    }

    return <OurCommunity testimonials={testimonials} />;
  } catch (error) {
    console.error("OurCommunityServer error:", error);
    return <OurCommunity testimonials={[]} />;
  }
}
