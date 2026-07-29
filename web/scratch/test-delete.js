const { getSanityClient } = require("../lib/sanity/client");

async function run() {
  const client = getSanityClient();
  console.log("Deleting document jScjZRzA5AeKUzlHC18kaB (Testing demo day)...");
  try {
    const res = await client.delete("jScjZRzA5AeKUzlHC18kaB");
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
