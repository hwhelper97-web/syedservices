const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

// TEMP DATABASE
let applications = [];

// SAVE APPLICATION
app.post("/api/visa/pakistan", upload.any(), (req, res) => {
  const newApp = {
    ...req.body,
    files: req.files,
  };

  applications.push(newApp);

  console.log("Saved:", newApp);   // 👈 IMPORTANT

  res.json({ success: true });
});

// GET ALL APPLICATIONS
app.get("/api/admin/applications", (req, res) => {
  res.json(applications);
});

app.listen(5000, () => console.log("Backend running"));