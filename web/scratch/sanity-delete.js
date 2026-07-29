const https = require("https");

const token = "skjOVR9sqsxiKSKk3Vd1b5hZGL1y0NVkVJE0kM0DJAGFvlD2X3ixgp72GzMkKzIpXOaSReEEzMduV4tx7MRrwL3xSa91kcdqbt1xYf9M9G5BLIRItreoEvaVIQ6guanVEXwv2wBAJ4n8hLwMP37KjnM47uVBsbt3cynFNiDlHW8sSDoCgltG";
const data = JSON.stringify({
  mutations: [
    {
      delete: {
        id: "jScjZRzA5AeKUzlHC18kaB"
      }
    }
  ]
});

const options = {
  hostname: "gkt4v4d6.api.sanity.io",
  path: "/v2021-10-21/data/mutate/production",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "Content-Length": data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = "";
  res.on("data", chunk => responseData += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", responseData);
  });
});

req.on("error", console.error);
req.write(data);
req.end();
