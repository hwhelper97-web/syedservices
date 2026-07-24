const http = require("http");

console.log("Triggering local database seed...");
http.get("http://localhost:3000/api/seed", (res) => {
  let body = "";
  res.on("data", (chunk) => {
    body += chunk;
  });
  res.on("end", () => {
    console.log("Response Status:", res.statusCode);
    console.log("Response Body:", body);
  });
}).on("error", (error) => {
  console.error("Request Error:", error);
});
