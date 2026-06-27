# Christian Fellowship Church — Full Website + CMS

Built with **Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · Prisma · PostgreSQL · Auth.js · Cloudinary**

---

## Quick Start

### 1. Unzip and install
```bash
unzip cft-church.zip && cd cft-church
pnpm install
```

### 2. Configure environment
```bash
cp .env.local .env.local.backup   # backup template
# Edit .env.local and fill in all values (see below)
```

### 3. Set up the database
```bash
npx prisma db push        # creates all tables
pnpm db:seed           # creates admin user + sample data
```

### 4. Run
```bash
pnpm dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Public website |
| http://localhost:3000/admin | Admin CMS |
| http://localhost:3000/admin/login | Admin login |



---

## Environment Variables (.env.local)

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your site URL (e.g. `https://yourchurch.com`) |
| `CLOUDINARY_CLOUD_NAME` | [cloudinary.com](https://cloudinary.com) → Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `YOUTUBE_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → Enable YouTube Data API v3 |
| `YOUTUBE_CHANNEL_ID` | Your YouTube channel URL: `youtube.com/channel/UC_xxxxxxxxx` |

---

## Public Pages

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/about` | About Us |
| `/events` | Events |
| `/ask-collins` | Ask Collins |
| `/join-us-live` | Join Us Live (YouTube) |

---

## Admin CMS Pages

| Route | Manages |
|-------|---------|
| `/admin` | Dashboard overview |
| `/admin/homepage` | Hero slides, join/visit text, pray heading |
| `/admin/about` | About us text, shepherd bio + photos |
| `/admin/events` | Create/edit/delete events |
| `/admin/calendar` | Add/edit/delete calendar entries |
| `/admin/ask-collins` | Review questions, publish answers |
| `/admin/join-us-live` | YouTube channel ID setting |
| `/admin/service-times` | Service name, day, time |
| `/admin/community` | Testimonials + profile photos |
| `/admin/media` | Upload, browse, delete all images |
| `/admin/settings` | Church info, address, phone, map embed |

---

## Useful Commands

```bash
pnpm dev              # development server
pnpm build            # production build
pnpm start            # production server
pnpm db:push          # sync schema to database
pnpm db:seed          # seed default data
pnpm db:studio        # open Prisma Studio GUI
```

---

## How YouTube Live Works

1. Enter your YouTube Channel ID in `/admin/join-us-live`
2. The page checks every 60 seconds if your channel is live
3. If live → shows the live stream automatically
4. If not live → shows the latest uploaded sermon automatically
5. Previous Sermons row always shows the 4 most recent videos
6. No code changes ever needed

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

Add all `.env.local` variables to your Vercel project settings under **Environment Variables**.
