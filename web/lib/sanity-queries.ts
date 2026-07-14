import { sanityFetch } from "@/lib/sanity/fetch";
import { getSanityClient } from "@/lib/sanity/client";

// NOTE: These queries assume Sanity document types matching files in sanity/schemaTypes.
// We keep response shapes compatible with existing frontend components.

export type SanitySiteSetting = { key: string; value: string };

export async function fetchHeroSlides() {
  const q = `*[_type == "heroSlide" && active == true]| order(order asc){
    _id,
    title,
    titleTa,
    subtitle,
    subtitleTa,
    description,
    descriptionTa,
    "imageUrl": image.asset->url,
    ctaText,
    ctaHref,
    order,
    active,
  }`;

  try {
    let slides = await sanityFetch<any[]>(q);
    if (slides.length === 0) {
      console.log("[fetchHeroSlides] Seeding default hero slides into Sanity...");
      const client = getSanityClient();
      await Promise.all([
        client.create({ _type: "heroSlide", title: "Welcome Home", subtitle: "Sunday Service · 9am & 11am", order: 0, active: true }),
        client.create({ _type: "heroSlide", title: "Faith. Hope. Love.", subtitle: "Building a community rooted in Christ", order: 1, active: true }),
        client.create({ _type: "heroSlide", title: "Come as You Are", subtitle: "You are welcome here, always", order: 2, active: true }),
      ]);
      slides = await client.fetch<any[]>(q);
    }
    return slides;
  } catch (error) {
    console.error("fetchHeroSlides error:", error);
    return sanityFetch<any[]>(q);
  }
}

export async function fetchEvents(opts?: { activeOnly?: boolean }) {
  const activeOnly = opts?.activeOnly ?? true;
  const q = `*[_type == "event"${activeOnly ? " && active == true" : ""}]| order(date asc){
    _id,
    title,
    titleTa,
    description,
    descriptionTa,
    date,
    endDate,
    time,
    timeTa,
    location,
    locationTa,
    imageUrl,
    featured,
    active,
  }`;

  return sanityFetch<any[]>(q);
}

export async function fetchCalendarEvents() {
  const q = `*[_type == "event" && active == true]{
    _id,
    title,
    titleTa,
    description,
    descriptionTa,
    date,
    active
  }| order(date asc)`;
  return sanityFetch<any[]>(q);
}

export async function fetchServiceTimes() {
  const q = `*[_type == "service" && active == true]| order(order asc){
    _id,
    name,
    nameTa,
    day,
    dayTa,
    time,
    timeTa,
    order,
    active
  }`;
  return sanityFetch<any[]>(q);
}

export async function fetchGalleryImages() {
  const q = `*[_type == "galleryImage" && active == true]| order(order asc){
    _id,
    title,
    image,
    order,
    active
  }`;
  return sanityFetch<any[]>(q);
}

export async function fetchHomepageContent() {
  const q = `*[_type == "homepageContent"][0]{
    joinText,
    joinTextTa,
    visitText,
    visitTextTa,
    prayerHeading,
    prayerHeadingTa
  }`;
  return sanityFetch<any>(q);
}

export async function fetchFooter() {
  const q = `*[_type == "footer"][0]{
    address,
    addressTa,
    phone,
    email,
    mapEmbed
  }`;
  return sanityFetch<any>(q);
}

export async function fetchPrayerRequestsApproved() {
  const q = `*[_type == "prayerRequest" && approved == true && archived == false]| order(createdAt desc){
    _id,
    name,
    email,
    prayerRequest,
    anonymous,
    approved,
    archived,
    createdAt
  }`;
  return sanityFetch<any[]>(q);
}

export async function fetchCollinsQuestions(opts?: { status?: string; archived?: boolean; search?: string; unread?: boolean; page?: number; limit?: number }) {
  // Admin list uses Prisma filters; we implement minimal compatibility with query parameters.
  // We keep it simple because admin UI expects pagination + counts.
  const page = opts?.page ?? 1;
  const limit = Math.min(50, Math.max(1, opts?.limit ?? 20));
  const skip = (page - 1) * limit;
  const status = opts?.status;
  const archived = opts?.archived;
  const unread = opts?.unread;
  const search = (opts?.search ?? "").trim();

  // Build filter string safely (Sanity GROQ doesn’t support parameterizing field paths inside conditionally-built strings easily).
  let filter = `[_type == "askCollins"`;
  if (status && status !== "ALL") filter += ` && status == $status`;
  if (typeof archived === "boolean") filter += ` && archived == $archived`;
  if (typeof unread === "boolean" && unread) filter += ` && read == false && archived == false`;
  if (search) filter += ` && (name match $search || email match $search || question match $search)`;
  filter += `]`;

  const qItems = `*${filter}| order(createdAt desc)[${skip}...${skip + limit}]{
    _id,
    name,
    phone,
    email,
    question,
    questionTa,
    consent,
    videoName,
    timestamp,
    status,
    read,
    archived,
    createdAt,
    answer,
    answerTa,
    answerTitle,
    answerTitleTa,
  }`;

  const qTotal = `count(*${filter})`;
  const qUnreadCount = `count(*[_type == "askCollins" && read == false && archived == false])`;
  const qPendingCount = `count(*[_type == "askCollins" && status == "PENDING" && archived == false])`;

  const params: Record<string, unknown> = {};
  if (status && status !== "ALL") params.status = status;
  if (typeof archived === "boolean") params.archived = archived;
  if (search) params.search = `${search}*`;

  const [items, total, unreadCount, pendingCount] = await Promise.all([
    sanityFetch<any[]>(qItems, params),
    sanityFetch<number>(qTotal, params),
    sanityFetch<number>(qUnreadCount),
    sanityFetch<number>(qPendingCount),
  ]);

  return { items, total, page, limit, unreadCount, pendingCount };
}


export async function fetchAnswersFromTheWord(opts?: { activeOnly?: boolean }) {
  const activeOnly = opts?.activeOnly ?? true;
  const q = `*[_type == "answerFromTheWord"${activeOnly ? " && active != false" : ""}]| order(order asc, publishDate desc, _createdAt desc){
    _id,
    question,
    questionTa,
    title,
    titleTa,
    answer,
    answerTa,
    "imageUrl": featuredImage.asset->url,
    publishDate,
    category,
    categoryTa,
    excerpt,
    excerptTa,
    active,
    order,
    _createdAt
  }`;
  return sanityFetch<any[]>(q);
}

export async function fetchAnswerById(id: string) {
  const q = `*[_type == "answerFromTheWord" && (_id == $id || _id == "drafts." + $id)][0] {
    _id,
    question,
    questionTa,
    title,
    titleTa,
    answer,
    answerTa,
    "imageUrl": featuredImage.asset->url,
    publishDate,
    category,
    categoryTa,
    excerpt,
    excerptTa,
    active,
    _createdAt
  }`;
  return sanityFetch<any>(q, { id }, [], false);
}

export async function fetchSiteSettingsFlat() {
  const q = `*[_type == "siteSetting"]{ key, value }`;
  return sanityFetch<SanitySiteSetting[]>(q);
}

export async function fetchWeStayActive(opts?: { activeOnly?: boolean }) {
  const activeOnly = opts?.activeOnly ?? true;
  const q = `*[_type == "weStayActive"${activeOnly ? " && active != false" : ""}]| order(order asc){
    _id,
    title,
    titleTa,
    description,
    descriptionTa,
    "imageUrl": image.asset->url,
    order,
    active
  }`;
  return sanityFetch<any[]>(q);
}

export async function fetchAnnouncements(opts?: { activeOnly?: boolean }) {
  const activeOnly = opts?.activeOnly ?? true;
  const q = `*[_type == "announcement"${activeOnly ? " && active != false" : ""}]| order(date desc){
    _id,
    title,
    titleTa,
    content,
    contentTa,
    date,
    active
  }`;
  return sanityFetch<any[]>(q);
}

