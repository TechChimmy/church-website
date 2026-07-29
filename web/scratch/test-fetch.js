// web/scratch/test-fetch.js
require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gkt4v4d6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: true, // Emulate standard fetch with CDN
});

async function run() {
  try {
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
    const res = await client.fetch(q);
    console.log("Query Results:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
