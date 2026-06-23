# Supabase Storage — Image Uploads Setup Guide

This replaces the old Cloudinary-based image uploads with **Supabase Storage**,
using a single public bucket: **`cms-images`**.

## 1. Create the bucket

**Option A — Dashboard:**
Supabase Dashboard → Storage → New bucket → name `cms-images` → toggle **Public bucket** ON.

**Option B — SQL Editor:** run `prisma/setup-storage-bucket.sql`.

## 2. Set environment variables

Add to `.env` (already pre-filled with your project URL; you just need the service role key):

```
SUPABASE_URL=https://prvwqlkrfqamvqansoct.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<get this from Project Settings → API → service_role key>
```

The service role key is secret — never expose it client-side. It's only used in
`lib/supabase-admin.ts`, which is imported only from server-side API routes.

## 3. Apply the database changes

Two new things need to land in the database:

- `MediaItem.publicId` → renamed to `MediaItem.path` (object path in the bucket, replaces the old Cloudinary public ID)
- 8 new `SiteSetting` rows for Doctrine / Activity / Events-banner images

**Option A:**
```
npm run db:push
npm run db:seed
```

**Option B — SQL Editor:** run `prisma/migrate-supabase-storage.sql`.

## 4. Install / uninstall packages

```
npm uninstall cloudinary
npm install   # @supabase/supabase-js is already a dependency
```

## 5. Done — where uploads now show up

| Area | Admin page | Where images are stored |
|---|---|---|
| Hero slider | Homepage → Hero Slides | `HeroSlide.imageUrl` |
| About banner | About Page → About Us Section | `SiteSetting.about_image` |
| Pastor image | About Page → Our Shepherd Section | `SiteSetting.shepherd_image` |
| Doctrine images (4) | About Page → Our Doctrine Images | `SiteSetting.doctrine_*_image` |
| Events page banner | Events → Events Page Banner | `SiteSetting.events_banner_image` |
| Activity images (3) | Events → We Stay Active — Activity Images | `SiteSetting.activity_*_image` |
| Event images | Events → Add/Edit Event | `Event.imageUrl` |

Every uploaded image is also logged in **Admin → Media Library**, and every
frontend component falls back to its original local `/public/images/...`
file whenever no image has been uploaded yet — nothing breaks on a fresh
install with no uploads.
