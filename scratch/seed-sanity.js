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

async function run() {
  console.log("Starting seeding process...");

  // 1. Delete existing documents of specific types
  const typesToDelete = ['heroSlide', 'community', 'service', 'footer', 'homepageContent', 'announcement'];
  for (const type of typesToDelete) {
    console.log(`Clearing type: ${type}`);
    const docs = await client.fetch(`*[_type == "${type}"]{_id}`);
    for (const doc of docs) {
      await client.delete(doc._id);
    }
  }

  // 2. Seed heroSlide
  console.log("Seeding heroSlide...");
  const slides = [
    {
      _type: "heroSlide",
      title: "Welcome Home",
      subtitle: "Sunday Service · 9am & 11am",
      description: "Join us in person or online for worship.",
      order: 0,
      active: true,
    },
    {
      _type: "heroSlide",
      title: "Faith. Hope. Love.",
      subtitle: "Building a community rooted in Christ",
      description: "Grow in faith, live in hope, walk in love.",
      order: 1,
      active: true,
    },
    {
      _type: "heroSlide",
      title: "Come as You Are",
      subtitle: "You are welcome here, always",
      description: "We are a diverse family united in Jesus Christ.",
      order: 2,
      active: true,
    }
  ];
  for (const s of slides) {
    await client.create(s);
  }

  // 3. Seed community (testimonials)
  console.log("Seeding community...");
  const testimonies = [
    {
      _type: "community",
      name: "Blake & Kay",
      quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The gentle nature accompanies the scene, with birds chirping melodiously and bees buzzing from flower to flower in the vibrant garden.",
      order: 0,
      active: true,
    },
    {
      _type: "community",
      name: "James & Ruth",
      quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside village. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses.",
      order: 1,
      active: true,
    },
    {
      _type: "community",
      name: "Michael & Sarah",
      quote: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon. The gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers.",
      order: 2,
      active: true,
    }
  ];
  for (const t of testimonies) {
    await client.create(t);
  }

  // 4. Seed service times
  console.log("Seeding service times...");
  const services = [
    { _type: "service", name: "Sunday Morning Service", day: "Sunday", time: "9:00 AM & 11:00 AM", order: 0, active: true },
    { _type: "service", name: "Sunday School", day: "Sunday", time: "10:00 AM", order: 1, active: true },
    { _type: "service", name: "Youth Meeting", day: "Sunday", time: "4:00 PM", order: 2, active: true },
    { _type: "service", name: "Midweek Prayer", day: "Wednesday", time: "7:00 PM", order: 3, active: true }
  ];
  for (const s of services) {
    await client.create(s);
  }

  // 5. Seed footer
  console.log("Seeding footer...");
  await client.createOrReplace({
    _id: "footer-global",
    _type: "footer",
    address: "75, Anna Salai, Chennai,\nTamil Nadu 600002, India.",
    phone: "+91 98876 54321",
    email: "info@cftchurch.com",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.991!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNiJF!5e0!3m2!1sen!2sin!4v1716000000000",
  });

  // 6. Seed homepageContent
  console.log("Seeding homepageContent...");
  await client.create({
    _type: "homepageContent",
    joinText: "Your paragraph lorem ipsum the warmth and charm of a cosy service — join us online wherever you are.",
    visitText: "Your paragraph lorem ipsum the warmth and charm of a cosy service — we'd love to see you in person this Sunday.",
    prayerHeading: "Pray with us"
  });

  // 7. Seed 1 test announcement
  console.log("Seeding announcement...");
  await client.create({
    _type: "announcement",
    title: "Welcome to Christian Fellowship Church!",
    content: "We are glad you are visiting our website. Feel free to join our services.",
    date: new Date().toISOString(),
    active: true
  });

  console.log("Seeding completed successfully!");
}

run().catch(console.error);
