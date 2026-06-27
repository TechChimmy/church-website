import OurCommunity from "./OurCommunity";
import { sanityFetch } from "@/lib/sanity/fetch";
import { getSanityClient } from "@/lib/sanity/client";

export default async function OurCommunityServer() {
  try {
    const client = getSanityClient();
    const q = `*[_type == "community" && active == true] | order(order asc) {
      _id,
      name,
      quote,
      "imageUrl": image.asset->url
    }`;

    let items = await sanityFetch<any[]>(q);

    if (items.length === 0) {
      console.log("[OurCommunityServer] Seeding default testimonials into Sanity...");
      await Promise.all([
        client.create({
          _type: "community",
          name: "Blake & Kay",
          quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The gentle nature accompanies the scene, with birds chirping melodiously and bees buzzing from flower to flower in the vibrant garden.",
          order: 0,
          active: true,
        }),
        client.create({
          _type: "community",
          name: "James & Ruth",
          quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside village. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses.",
          order: 1,
          active: true,
        }),
        client.create({
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
      body: t.quote ?? "",
      imageUrl: t.imageUrl ?? null,
    }));

    return <OurCommunity testimonials={testimonials} />;
  } catch (error) {
    console.error("OurCommunityServer error:", error);
    return <OurCommunity testimonials={[]} />;
  }
}

