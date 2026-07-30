import { sanityFetch } from "@/lib/sanity/fetch";
import { getSanityClient } from "@/lib/sanity/client";
import { optimizeImageUrl } from "@/lib/sanity/image";

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
    let slides = await sanityFetch<any[]>(q, {}, [], false, 0);
    const client = getSanityClient();
    const count = await client.fetch<number>(`count(*[_type == "heroSlide"])`);
    if (count === 0) {
      console.log("[fetchHeroSlides] Seeding default hero slides into Sanity...");
      await Promise.all([
        client.createOrReplace({ _id: "hero-slide-welcome-home", _type: "heroSlide", title: "Welcome Home", subtitle: "Sunday Service · 9am & 11am", order: 0, active: true }),
        client.createOrReplace({ _id: "hero-slide-faith-hope-love", _type: "heroSlide", title: "Faith. Hope. Love.", subtitle: "Building a community rooted in Christ", order: 1, active: true }),
        client.createOrReplace({ _id: "hero-slide-come-as-you-are", _type: "heroSlide", title: "Come as You Are", subtitle: "You are welcome here, always", order: 2, active: true }),
      ]);
      slides = await client.fetch<any[]>(q);
    }
    return slides.map((s: any) => ({
      ...s,
      imageUrl: s.imageUrl ? optimizeImageUrl(s.imageUrl, 1920) : "",
    }));
  } catch (error) {
    console.error("fetchHeroSlides error:", error);
    return sanityFetch<any[]>(q, {}, [], false, 0);
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

  const res = await sanityFetch<any[]>(q, {}, [], false, 0);
  return res.map((r: any) => ({
    ...r,
    imageUrl: r.imageUrl ? optimizeImageUrl(r.imageUrl, 1200) : "",
  }));
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
  return sanityFetch<any[]>(q, {}, [], false, 0);
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
  return sanityFetch<any[]>(q, {}, [], false, 60);
}

export async function fetchGalleryImages() {
  const q = `*[_type == "galleryImage" && active == true]| order(order asc){
    _id,
    title,
    image,
    order,
    active
  }`;
  return sanityFetch<any[]>(q, {}, [], false, 60);
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
  return sanityFetch<any>(q, {}, [], false, 60);
}

export async function fetchFooter() {
  const q = `*[_type == "footer"][0]{
    address,
    addressTa,
    phone,
    email,
    mapEmbed
  }`;
  return sanityFetch<any>(q, {}, [], false, 60);
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
  return sanityFetch<any[]>(q, {}, [], false, 60);
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
    sanityFetch<any[]>(qItems, params, [], false),
    sanityFetch<number>(qTotal, params, [], false),
    sanityFetch<number>(qUnreadCount, {}, [], false),
    sanityFetch<number>(qPendingCount, {}, [], false),
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
  const res = await sanityFetch<any[]>(q, {}, [], false, 60);
  return res.map((r: any) => ({
    ...r,
    imageUrl: r.imageUrl ? optimizeImageUrl(r.imageUrl, 1000) : null,
  }));
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
  const res = await sanityFetch<any>(q, { id }, [], false, 60);
  if (res) {
    res.imageUrl = res.imageUrl ? optimizeImageUrl(res.imageUrl, 1200) : null;
  }
  return res;
}

export async function fetchSiteSettingsFlat() {
  const q = `*[_type == "siteSetting"]{ key, value }`;
  return sanityFetch<SanitySiteSetting[]>(q, {}, [], false, 60);
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
  let res = await sanityFetch<any[]>(q, {}, [], false, 0);

  if (res.length === 0) {
    const client = getSanityClient();
    const count = await client.fetch<number>(`count(*[_type == "weStayActive"])`);
    if (count === 0) {
      console.log("[fetchWeStayActive] Seeding default activity cards into Sanity...");
      await Promise.all([
        client.createOrReplace({
          _id: "we-stay-active-fellowship-groups",
          _type: "weStayActive",
          title: "Fellowship Groups",
          titleTa: "ஐக்கியக் குழுக்கள்",
          description: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. It's a place where time slows down and every moment is savoured like a cherished memory.",
          descriptionTa: "உங்கள் பத்தி லோரெம் இப்சம் ஒரு வசதியான, வெயில் நிறைந்த மதிய நேரத்தின் வெப்பம் மற்றும் கவர்ச்சியானது ஒரு விசித்திரமான கிராமப்புற குடிசையில் கழிக்கப்பட்டது. நெருப்பிடம் மென்மையான விரிசல் மற்றும் புதிதாக காய்ச்சப்பட்ட தேநீரின் வாசனை புலன்களை சூழ்ந்து, தூய்மையான திருப்தியான சூழ்நிலையை உருவாக்குகிறது. வெளியே, ஒரு மென்மையான காற்று இலைகள் வழியாக சலசலக்கிறது, பூக்கும் பூக்களின் இனிமையான வாசனையை சுமந்து செல்கிறது. இது நேரம் மெதுவாகக் குறையும் இடமாகும், மேலும் ஒவ்வொரு கணமும் ஒரு போற்றத்தக்க நினைவகமாக ரசிக்கப்படுகிறது.",
          order: 0,
          active: true
        }),
        client.createOrReplace({
          _id: "we-stay-active-church-retreat",
          _type: "weStayActive",
          title: "Church Retreat",
          titleTa: "திருச்சபை முகாம்",
          description: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. It's a place where time slows down and every moment is savoured like a cherished memory.",
          descriptionTa: "உங்கள் பத்தி லோரெம் இப்சம் ஒரு வசதியான, வெயில் நிறைந்த மதிய நேரத்தின் வெப்பம் மற்றும் கவர்ச்சியானது ஒரு விசித்திரமான கிராமப்புற குடிசையில் கழிக்கப்பட்டது. நெருப்பிடம் மென்மையான விரிசல் மற்றும் புதிதாக காய்ச்சப்பட்ட தேநீரின் வாசனை புலன்களை சூழ்ந்து, தூய்மையான திருப்தியான சூழ்நிலையை உருவாக்குகிறது. வெளியே, ஒரு மென்மையான காற்று இலைகள் வழியாக சலசலக்கிறது, பூக்கும் பூக்களின் இனிமையான வாசனையை சுமந்து செல்கிறது. இது நேரம் மெதுவாகக் குறையும் இடமாகும், மேலும் ஒவ்வொரு கணமும் ஒரு போற்றத்தக்க நினைவகமாக ரசிக்கப்படுகிறது.",
          order: 1,
          active: true
        }),
        client.createOrReplace({
          _id: "we-stay-active-evangelical-sunday",
          _type: "weStayActive",
          title: "Evangelical Sunday",
          titleTa: "சுவிசேஷ ஞாயிறு",
          description: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. It's a place where time slows down and every moment is savoured like a cherished memory.",
          descriptionTa: "உங்கள் பத்தி லோரெம் இப்சம் ஒரு வசதியான, வெயில் நிறைந்த மதிய நேரத்தின் வெப்பம் மற்றும் கவர்ச்சியானது ஒரு விசித்திரமான கிராமப்புற குடிசையில் கழிக்கப்பட்டது. நெருப்பிடம் மென்மையான விரிசல் மற்றும் புதிதாக காய்ச்சப்பட்ட தேநீரின் வாசனை புலன்களை சூழ்ந்து, தூய்மையான திருப்தியான சூழ்நிலையை உருவாக்குகிறது. வெளியே, ஒரு மென்மையான காற்று இலைகள் வழியாக சலசலக்கிறது, பூக்கும் பூக்களின் இனிமையான வாசனையை சுமந்து செல்கிறது. இது நேரம் மெதுவாகக் குறையும் இடமாகும், மேலும் ஒவ்வொரு கணமும் ஒரு போற்றத்தக்க நினைவகமாக ரசிக்கப்படுகிறது.",
          order: 2,
          active: true
        })
      ]);
      res = await client.fetch<any[]>(q);
    }
  }

  return res.map((r: any) => ({
    ...r,
    imageUrl: r.imageUrl ? optimizeImageUrl(r.imageUrl, 1200) : null,
  }));
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
  return sanityFetch<any[]>(q, {}, [], false, 60);
}

export async function fetchPublishedQuestions() {
  const q = `*[_type == "askCollins" && status == "PUBLISHED" && archived != true] | order(createdAt desc) {
    _id,
    name,
    question,
    questionTa,
    answer,
    answerTa,
    answerTitle,
    answerTitleTa,
    consent,
    createdAt
  }`;
  return sanityFetch<any[]>(q, {}, [], false, 60);
}

