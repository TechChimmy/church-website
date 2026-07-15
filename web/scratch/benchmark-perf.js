const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Read .env from web directory
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const client = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

async function measure(name, fn) {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    console.log(`[PASS] ${name}: ${duration}ms (results count: ${Array.isArray(res) ? res.length : (res ? 'yes' : 'no')})`);
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[FAIL] ${name}: ${duration}ms - Error: ${err.message}`);
    return null;
  }
}

async function run() {
  console.log("=== CFT Church Backend Query Benchmark ===");
  console.log(`Sanity Project ID: ${env.SANITY_PROJECT_ID}`);
  console.log(`YouTube Channel ID: ${env.YOUTUBE_CHANNEL_ID}`);
  console.log("------------------------------------------");

  // Test Sanity Fetches
  await measure("Sanity - fetchHeroSlides", () => {
    return client.fetch(`*[_type == "heroSlide" && active == true]| order(order asc){ _id, title }`);
  });

  await measure("Sanity - fetchSiteSettingsFlat", () => {
    return client.fetch(`*[_type == "siteSetting"]{ key, value }`);
  });

  await measure("Sanity - fetchEvents", () => {
    return client.fetch(`*[_type == "event" && active == true]| order(order asc, date asc){ _id, title }`);
  });

  await measure("Sanity - fetchPrayerRequestsApproved", () => {
    return client.fetch(`*[_type == "prayerRequest" && approved == true && archived == false]| order(createdAt desc){ _id }`);
  });

  await measure("Sanity - fetchFooter", () => {
    return client.fetch(`*[_type == "footer"][0]{ address }`);
  });

  // Test YouTube Fetches
  const apiKey = env.YOUTUBE_API_KEY;
  const channelId = env.YOUTUBE_CHANNEL_ID;

  await measure("YouTube - resolveChannelId via API", async () => {
    if (!channelId.startsWith("UC")) {
      // It's a handle
      const url = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&part=id&forHandle=${channelId}`;
      const res = await fetch(url);
      return res.json();
    } else {
      return channelId;
    }
  });

  await measure("YouTube - Scrape /live URL directly", async () => {
    const url = `https://www.youtube.com/channel/${channelId}/live`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });
    const text = await res.text();
    const canonicalMatch = text.match(/<link rel="canonical" href="([^"]+)">/);
    return canonicalMatch ? canonicalMatch[1] : null;
  });

  await measure("YouTube - playlistItems API (UU + channelId suffix)", async () => {
    const uploadsPlaylistId = "UU" + channelId.substring(2);
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10`;
    const res = await fetch(url);
    return res.json();
  });
}

run().catch(console.error);
