const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Read .env
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
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN || env.SANITY_API_TOKEN,
});

const schemas = [
  'heroSlide',
  'community',
  'homepageContent',
  'footer',
  'event',
  'calendarEvent',
  'service',
  'galleryImage',
  'prayerRequest',
  'askCollins',
  'answerFromTheWord',
  'siteSetting',
  'eventParticipation',
  'contactMessage',
  'announcement',
  'adminUser'
];

async function check() {
  console.log("Document counts in Sanity dataset:", env.SANITY_DATASET);
  for (const s of schemas) {
    try {
      const count = await client.fetch(`count(*[_type == "${s}"])`);
      console.log(`- ${s}: ${count}`);
    } catch (e) {
      console.log(`- ${s}: ERROR - ${e.message}`);
    }
  }
}

check();
