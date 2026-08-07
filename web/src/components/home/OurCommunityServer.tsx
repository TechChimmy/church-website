import OurCommunity from "./OurCommunity";
import { sanityFetch } from "@/lib/sanity/fetch";
import { getSanityClient } from "@/lib/sanity/client";
import { optimizeImageUrl } from "@/lib/sanity/image";
import { getAllSettings } from "@/lib/settings";

export default async function OurCommunityServer() {
  try {
    const client = getSanityClient();
    const q = `*[_type == "community" && active == true] | order(order asc) {
      _id,
      name,
      nameTa,
      quote,
      quoteTa,
      "imageUrl": image.asset->url
    }`;

    const [itemsRes, settings] = await Promise.all([
      sanityFetch<any[]>(q),
      getAllSettings().catch(() => ({})),
    ]);

    let items = itemsRes;

    const count = await client.fetch<number>(`count(*[_type == "community"])`);
    if (count === 0) {
      console.log("[OurCommunityServer] Seeding default testimonials into Sanity...");
      await Promise.all([
        client.createOrReplace({
          _id: "community-testimonial-blake-kay",
          _type: "community",
          name: "Blake & Kay",
          quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The gentle nature accompanies the scene, with birds chirping melodiously and bees buzzing from flower to flower in the vibrant garden.",
          order: 0,
          active: true,
        }),
        client.createOrReplace({
          _id: "community-testimonial-james-ruth",
          _type: "community",
          name: "James & Ruth",
          quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside village. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses.",
          order: 1,
          active: true,
        }),
        client.createOrReplace({
          _id: "community-testimonial-michael-sarah",
          _type: "community",
          name: "Michael & Sarah",
          quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon. The gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers.",
          order: 2,
          active: true,
        }),
      ]);

      items = await client.fetch<any[]>(q);
    }

    const testimonials = items.map((t) => ({
      id: t._id,
      name: t.name ?? "",
      nameTa: t.nameTa ?? "",
      body: t.quote ?? "",
      bodyTa: t.quoteTa ?? "",
      imageUrl: t.imageUrl ? optimizeImageUrl(t.imageUrl, 400) : null,
    }));

    return (
      <OurCommunity
        testimonials={testimonials}
        heading={(settings as Record<string, string>).community_heading}
        headingTa={(settings as Record<string, string>).community_heading_ta}
      />
    );
  } catch (error) {
    console.error("OurCommunityServer error:", error);
    return <OurCommunity testimonials={[]} />;
  }
}

