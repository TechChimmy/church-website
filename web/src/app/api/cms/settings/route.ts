// app/api/cms/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSanityClient } from "@/lib/sanity/client";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

const DEFAULT_SETTINGS = [
  // About Page
  { key: "about_image", label: "About Hero Image URL", group: "about", type: "text", value: "/images/about/banner.jpg" },
  { key: "about_hero_title", label: "About Hero Title (English)", group: "about", type: "text", value: "About Us" },
  { key: "about_hero_title_ta", label: "About Hero Title (Tamil)", group: "about", type: "text", value: "எங்களைப் பற்றி" },
  { key: "about_hero_subtitle", label: "About Hero Subtitle (English)", group: "about", type: "text", value: "Christian Fellowship Church" },
  { key: "about_hero_subtitle_ta", label: "About Hero Subtitle (Tamil)", group: "about", type: "text", value: "கிறிஸ்தவ ஐக்கிய சபை" },
  { key: "about_heading", label: "About Heading (English)", group: "about", type: "text", value: "About Us" },
  { key: "about_heading_ta", label: "About Heading (Tamil)", group: "about", type: "text", value: "எங்களைப் பற்றி" },
  { key: "about_body", label: "About Content (English)", group: "about", type: "textarea", value: "Your paragraph lorem ipsum the warmth and charm of a cosy Sunday afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment." },
  { key: "about_body_ta", label: "About Content (Tamil)", group: "about", type: "textarea", value: "விசுவாசம், அன்பு மற்றும் கிறிஸ்தவ ஐக்கியத்தின் மூலம் ஒரு புதிய சமூதாயத்தை உருவாக்குவதே எங்களின் நோக்கம்." },
  { key: "community_heading", label: "Community Section Heading (English)", group: "about", type: "text", value: "Our Community" },
  { key: "community_heading_ta", label: "Community Section Heading (Tamil)", group: "about", type: "text", value: "எங்கள் சமூகம்" },

  // Shepherd
  { key: "shepherd_heading", label: "Shepherd Heading", group: "shepherd", type: "text", value: "Our Shepherd" },
  { key: "shepherd_body", label: "Shepherd Content", group: "shepherd", type: "textarea", value: "Your paragraph lorem ipsum the warmth and charm of a cosy Sunday afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment." },
  { key: "shepherd_image", label: "Shepherd Image URL", group: "shepherd", type: "text", value: "/images/about/pastor.jpg" },

  // Doctrine
  { key: "doctrine_heading", label: "Doctrine Section Heading (English)", group: "doctrine", type: "text", value: "Our Doctrine" },
  { key: "doctrine_heading_ta", label: "Doctrine Section Heading (Tamil)", group: "doctrine", type: "text", value: "எங்கள் உபதேசம்" },
  { key: "doctrine_paragraph", label: "Doctrine Section Intro (English)", group: "doctrine", type: "textarea", value: "Our doctrine is based on the Bible and the faith that has been passed down." },
  { key: "doctrine_paragraph_ta", label: "Doctrine Section Intro (Tamil)", group: "doctrine", type: "textarea", value: "எங்கள் உபதேசம் வேதாகமத்தை அடிப்படையாகக் கொண்டது." },
  { key: "doctrine_word_image", label: "Doctrine: The Word Image URL", group: "doctrine", type: "text", value: "/images/doctrine/word.jpg" },
  { key: "doctrine_faith_image", label: "Doctrine: Faith Image URL", group: "doctrine", type: "text", value: "/images/doctrine/faith.jpg" },
  { key: "doctrine_spirit_image", label: "Doctrine: Spirit Image URL", group: "doctrine", type: "text", value: "/images/doctrine/spirit.jpg" },
  { key: "doctrine_church_image", label: "Doctrine: The Church Image URL", group: "doctrine", type: "text", value: "/images/doctrine/church.jpg" },

  // Events Page Banner
  { key: "events_banner_image", label: "Events Page Banner Image URL", group: "events", type: "text", value: "/images/banners/events.jpg" },
  { key: "events_hero_title", label: "Events Hero Title (English)", group: "events", type: "text", value: "Upcoming Events" },
  { key: "events_hero_title_ta", label: "Events Hero Title (Tamil)", group: "events", type: "text", value: "நிகழ்ச்சிகள்" },
  { key: "events_hero_subtitle", label: "Events Hero Subtitle (English)", group: "events", type: "text", value: "Join Us in Fellowship & Worship" },
  { key: "events_hero_subtitle_ta", label: "Events Hero Subtitle (Tamil)", group: "events", type: "text", value: "எங்கள் சபை நிகழ்வுகள்" },

  // Activity Images
  { key: "activity_fellowship_image", label: "Activity: Fellowship Image URL", group: "activity", type: "text", value: "/images/activity/fellowship.jpg" },
  { key: "activity_retreat_image", label: "Activity: Retreat Image URL", group: "activity", type: "text", value: "/images/activity/retreat.jpg" },
  { key: "activity_evangelical_image", label: "Activity: Evangelical Image URL", group: "activity", type: "text", value: "/images/activity/evangelical.jpg" },

  // Homepage Info
  { key: "join_us_text", label: "Join Us Section Copy", group: "homepage", type: "textarea", value: "Your paragraph lorem ipsum the warmth and charm of a cosy service — join us online wherever you are." },
  { key: "visit_us_text", label: "Visit Us Section Copy", group: "homepage", type: "textarea", value: "Your paragraph lorem ipsum the warmth and charm of a cosy service — we'd love to see you in person this Sunday." },
  { key: "visit_us_btn_text", label: "Visit Us Button Text (English)", group: "homepage", type: "text", value: "Get Directions" },
  { key: "visit_us_btn_text_ta", label: "Visit Us Button Text (Tamil)", group: "homepage", type: "text", value: "திசைகளைப் பெறுக" },
  { key: "visit_us_btn_link", label: "Visit Us Button Link (Leave empty to scroll to footer)", group: "homepage", type: "text", value: "" },
  { key: "pray_heading", label: "Pray Section Heading", group: "homepage", type: "text", value: "Pray with us" },

  // YouTube Channel/API Key settings
  { key: "youtube_api_key", label: "YouTube API Key", group: "youtube", type: "text", value: "your_youtube_api_key" },
  { key: "youtube_channel_id", label: "YouTube Channel ID", group: "youtube", type: "text", value: "your_channel_id" },

  // Ask Collins Page Settings
  { key: "ask_collins_banner_image", label: "Ask Collins Hero Banner Image URL", group: "ask_collins", type: "text", value: "/images/banners/ask-collins.jpg" },
  { key: "ask_collins_hero_title", label: "Ask Collins Hero Title (English)", group: "ask_collins", type: "text", value: "Ask Collins" },
  { key: "ask_collins_hero_title_ta", label: "Ask Collins Hero Title (Tamil)", group: "ask_collins", type: "text", value: "போதகரிடம் கேளுங்கள்" },
  { key: "ask_collins_hero_subtitle", label: "Ask Collins Hero Subtitle (English)", group: "ask_collins", type: "text", value: "Biblical Wisdom & Guidance" },
  { key: "ask_collins_hero_subtitle_ta", label: "Ask Collins Hero Subtitle (Tamil)", group: "ask_collins", type: "text", value: "உங்கள் கேள்விகளுக்கு வேதாகம பதில்கள்" },
  { key: "ask_collins_tagline", label: "Form Tagline (English)", group: "ask_collins", type: "text", value: "HAVE A QUESTION?" },
  { key: "ask_collins_tagline_ta", label: "Form Tagline (Tamil)", group: "ask_collins", type: "text", value: "கேள்வி உள்ளதா?" },
  { key: "ask_collins_heading", label: "Form Heading (English)", group: "ask_collins", type: "text", value: "Ask Pastor Collins" },
  { key: "ask_collins_heading_ta", label: "Form Heading (Tamil)", group: "ask_collins", type: "text", value: "போதகர் கோலின்ஸிடம் கேளுங்கள்" },
  { key: "ask_collins_subheading", label: "Form Subheading (English)", group: "ask_collins", type: "textarea", value: "Do you have questions about faith, Scripture, life, or Christian doctrine? Submit your question below." },
  { key: "ask_collins_subheading_ta", label: "Form Subheading (Tamil)", group: "ask_collins", type: "textarea", value: "விசுவாசம், வேதாகமம், வாழ்க்கை அல்லது கிறிஸ்தவ உபதேசம் பற்றிய கேள்விகள் உள்ளதா? உங்கள் கேள்வியை கீழே சமர்ப்பிக்கவும்." },
  { key: "answered_questions_tagline", label: "Q&A Section Tagline (English)", group: "ask_collins", type: "text", value: "COMMUNITY Q&A" },
  { key: "answered_questions_tagline_ta", label: "Q&A Section Tagline (Tamil)", group: "ask_collins", type: "text", value: "கேள்வி & பதில்" },
  { key: "answered_questions_heading", label: "Q&A Section Heading (English)", group: "ask_collins", type: "text", value: "Questions Answered by Pastor Collins" },
  { key: "answered_questions_heading_ta", label: "Q&A Section Heading (Tamil)", group: "ask_collins", type: "text", value: "போதகர் கோலின்ஸுடன் கேள்வி-பதில்" },
  { key: "answers_word_tagline", label: "Answers Blog Section Tagline (English)", group: "ask_collins", type: "text", value: "EXPLORE THE TRUTH" },
  { key: "answers_word_tagline_ta", label: "Answers Blog Section Tagline (Tamil)", group: "ask_collins", type: "text", value: "சத்தியத்தை ஆராயுங்கள்" },
  { key: "answers_word_heading", label: "Answers Blog Section Heading (English)", group: "ask_collins", type: "text", value: "Answers from the Word" },
  { key: "answers_word_heading_ta", label: "Answers Blog Section Heading (Tamil)", group: "ask_collins", type: "text", value: "வேதாகமத்தில் இருந்து பதில்கள்" },
];

export async function GET() {
  try {
    const client = getSanityClient();
    let settings = await client.fetch(
      `*[_type == "siteSetting"] | order(group asc, label asc) {
        _id,
        key,
        label,
        group,
        type,
        value
      }`
    );

    // If no settings exist in Sanity, automatically seed the defaults
    if (settings.length === 0) {
      console.log("[Settings API] Seeding default settings into Sanity...");
      await Promise.all(
        DEFAULT_SETTINGS.map((s) => {
          const docId = `setting-${s.key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
          return client.createOrReplace({
            _id: docId,
            _type: "siteSetting",
            key: s.key,
            label: s.label,
            group: s.group,
            type: s.type,
            value: s.value,
          });
        })
      );

      // Re-fetch seeded settings
      settings = await client.fetch(
        `*[_type == "siteSetting"] | order(group asc, label asc) {
          _id,
          key,
          label,
          group,
          type,
          value
        }`
      );
    }

    // Map _id to id for admin UI compatibility
    const mapped = settings.map((s: any) => ({
      id: s._id,
      key: s.key,
      label: s.label,
      group: s.group,
      type: s.type,
      value: s.value,
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/cms/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { key, value, label, group, type } = await req.json();
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const client = getSanityClient();
    
    // Construct a deterministic ID based on the key
    const docId = `setting-${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

    const doc = {
      _id: docId,
      _type: "siteSetting",
      key,
      value: value ?? "",
      label: label ?? key,
      group: group ?? "general",
      type: type ?? "text",
    };

    const updated = await client.createOrReplace(doc);
    
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/events");
    revalidatePath("/join-us-live");
    (revalidateTag as any)("sanity");
    
    return NextResponse.json({
      id: updated._id,
      key: updated.key,
      value: updated.value,
      label: updated.label,
      group: updated.group,
      type: updated.type,
    });
  } catch (error) {
    console.error("PATCH /api/cms/settings error:", error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}

