# Telegram Integration Setup

## 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Give your bot a name (e.g. `CFT Church Bot`)
4. Give it a username (e.g. `cftchurch_bot`)
5. Copy the **Bot Token** — it looks like `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`

## 2. Create/Find your Group Chat ID

1. Create a Telegram group (e.g. "CFT Church Admin")
2. Add your bot to the group
3. Give the bot **admin** permissions (or at minimum "Send Messages")
4. Send any message in the group
5. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
6. Look for `"chat":{"id":-XXXXXXXXXX}` — the negative number is your Group Chat ID

## 3. Add to .env.local

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
TELEGRAM_GROUP_CHAT_ID=-1001234567890
```

## 4. Run Database Migration

After adding the new Prisma models, run:

```bash
npx prisma db push
```

Or if using migrations:

```bash
npx prisma migrate dev --name add_prayer_contact_tables
```

## 5. New Admin Pages

- `/admin/prayers` — View and manage prayer requests
- `/admin/messages` — View and manage contact messages
- `/admin/ask-collins` — Already existed; now also sends to Telegram

## Form → Telegram Flow

| Form | API Route | Telegram Format |
|------|-----------|-----------------|
| Pray With Us | `/api/prayer-request` | 🙏 NEW PRAYER REQUEST |
| Ask Collins | `/api/ask-collins` | ❓ NEW ASK COLLINS QUESTION |
| Write To Us | `/api/contact-message` | 📩 NEW CONTACT MESSAGE |

All submissions are **also saved to the database** so nothing is lost if Telegram is unavailable.
