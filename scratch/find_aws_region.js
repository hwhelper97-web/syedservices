const https = require("https");

https.get("https://ip-ranges.amazonaws.com/ip-ranges.json", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      const matches = json.ipv6_prefixes.filter(p => {
        // Check if the IP prefix covers our target IP 2406:da1a:0314:7102:57c5:5af4:cabd:6d3c
        // 2406:da1a is 32 bits. Let's convert to subnet or search for prefix
        return p.ipv6_prefix.includes("2406:da1a");
      });
      console.log("All 2406:da1a prefixes:", matches.map(m => ({ prefix: m.ipv6_prefix, region: m.region })));
    } catch (e) {
      console.error(e);
    }
  });
}).on("error", console.error);
