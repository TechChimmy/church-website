const https = require("https");

const token = "skjOVR9sqsxiKSKk3Vd1b5hZGL1y0NVkVJE0kM0DJAGFvlD2X3ixgp72GzMkKzIpXOaSReEEzMduV4tx7MRrwL3xSa91kcdqbt1xYf9M9G5BLIRItreoEvaVIQ6guanVEXwv2wBAJ4n8hLwMP37KjnM47uVBsbt3cynFNiDlHW8sSDoCgltG";

// Step 1: Fetch all ids
https.get("https://gkt4v4d6.api.sanity.io/v2021-10-21/data/query/production?query=*[_type%20==%20%22weStayActive%22]%20%7B%20_id%20%7D", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const docs = JSON.parse(data).result;
    console.log("Found docs to delete:", docs);
    if (!docs || docs.length === 0) {
      console.log("No docs found.");
      return;
    }
    
    // Step 2: Delete them
    const mutations = docs.map(d => ({ delete: { id: d._id } }));
    const payload = JSON.stringify({ mutations });
    
    const options = {
      hostname: "gkt4v4d6.api.sanity.io",
      path: "/v2021-10-21/data/mutate/production",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Length": payload.length
      }
    };
    
    const req = https.request(options, (mutateRes) => {
      let rData = "";
      mutateRes.on("data", chunk => rData += chunk);
      mutateRes.on("end", () => {
        console.log("Delete status:", mutateRes.statusCode);
        console.log("Response:", rData);
      });
    });
    
    req.on("error", console.error);
    req.write(payload);
    req.end();
  });
}).on("error", console.error);
