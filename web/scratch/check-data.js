const { getSanityClient } = require("../lib/sanity/client");

async function check() {
  const client = getSanityClient();
  
  console.log("=== WE STAY ACTIVE ===");
  const activeDocs = await client.fetch(`*[_type == "weStayActive"] { _id, title, image, active }`);
  console.log(JSON.stringify(activeDocs, null, 2));

  console.log("=== EVENTS ===");
  const eventDocs = await client.fetch(`*[_type == "event"] { _id, title, imageUrl, active }`);
  console.log(JSON.stringify(eventDocs, null, 2));
}

check().catch(console.error);
