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
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN || env.SANITY_API_TOKEN,
});

const ALL_ANSWERS = [
  { id: 1, title: "Try Jesus", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 2, title: "The Word of God", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 3, title: "Faith Over Fear", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 4, title: "Grace and Truth", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 5, title: "Walking in the Spirit", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 6, title: "The Power of Prayer", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
  { id: 7, title: "Renewed Every Morning", body: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory." },
];

async function run() {
  console.log("Starting Answers From The Word migration...");

  for (const card of ALL_ANSWERS) {
    // Check if the document already exists in Sanity
    const existing = await client.fetch(
      `*[_type == "answerFromTheWord" && title == $title][0]`,
      { title: card.title }
    );

    if (existing) {
      console.log(`Document "${card.title}" already exists in Sanity. Skipping creation.`);
      continue;
    }

    console.log(`Migrating card: "${card.title}"...`);

    // Path to the local image
    const imagePath = path.join(__dirname, '..', 'public', 'images', 'answers', `answer-${card.id}.jpg`);
    let imageField = null;

    if (fs.existsSync(imagePath)) {
      try {
        console.log(`Uploading image for "${card.title}": ${imagePath}`);
        const asset = await client.assets.upload('image', fs.createReadStream(imagePath), {
          filename: `answer-${card.id}.jpg`,
        });
        imageField = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        };
        console.log(`Uploaded asset: ${asset._id}`);
      } catch (err) {
        console.error(`Failed to upload image for "${card.title}":`, err.message);
      }
    } else {
      console.warn(`Image file does not exist at path: ${imagePath}`);
    }

    const doc = {
      _type: "answerFromTheWord",
      title: card.title,
      question: card.title,
      answer: card.body,
      featuredImage: imageField,
      publishDate: new Date().toISOString().slice(0, 10),
      category: "Faith",
      excerpt: card.body.slice(0, 160) + "...",
      order: card.id,
      active: true,
    };

    const created = await client.create(doc);
    console.log(`Created document in Sanity with ID: ${created._id}`);
  }

  console.log("Migration finished successfully!");
}

run().catch(console.error);
