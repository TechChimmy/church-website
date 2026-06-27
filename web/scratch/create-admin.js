const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');
const bcrypt = require('bcryptjs');

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
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node scratch/create-admin.js <email> <password>");
    process.exit(1);
  }

  const email = args[0].toLowerCase().trim();
  const password = args[1];

  console.log(`Checking if user ${email} already exists...`);
  const existing = await client.fetch(
    `*[_type == "adminUser" && email == $email][0]`,
    { email }
  );

  if (existing) {
    console.error(`Error: User with email ${email} already exists in Sanity!`);
    process.exit(1);
  }

  console.log("Hashing password...");
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log("Creating adminUser document in Sanity...");
  const userDoc = {
    _type: "adminUser",
    email,
    passwordHash: hash,
    role: "ADMIN",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = await client.create(userDoc);
  console.log(`Success! Admin user created with ID: ${created._id}`);
}

run().catch(console.error);
