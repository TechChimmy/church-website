// web/scratch/check-published.js
require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gkt4v4d6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function run() {
  try {
    const docs = await client.fetch(`*[_type == "askCollins"] {
      _id,
      name,
      question,
      status,
      answer,
      archived
    }`);
    console.log("Documents fetched:", JSON.stringify(docs, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
