const https = require("https");

https.get("https://uzvyxhjohegqymnudboi.supabase.co/rest/v1/", (res) => {
  console.log("Headers:", res.headers);
  let body = "";
  res.on("data", (c) => body += c);
  res.on("end", () => console.log("Body:", body));
}).on("error", console.error);
