const https = require("https");
https.get("https://gkt4v4d6.api.sanity.io/v2021-10-21/data/query/production?query=*[_type%20==%20%22event%22]%20%7B%20_id,%20title,%20featured,%20active,%20date%20%7D", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
}).on("error", console.error);
