const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

// Read .env
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found in web directory!");
  process.exit(1);
}
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

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID || env.SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET || env.SANITY_DATASET || 'production';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("Error: SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN is missing in .env!");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
});

async function run() {
  const users = await client.fetch(`*[_type == "adminUser"]`);
  console.log("Admin Users:", JSON.stringify(users, null, 2));
}

run().catch(console.error);
