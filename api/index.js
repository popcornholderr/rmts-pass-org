const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// 🧠 In-memory token store
const tokens = {
  USER_TOKEN_001: {
    pending: [],
    approved: []
  }
};

// CHECK ACCESS
app.post("/check", (req, res) => {
  const { token, device } = req.body;

  if (!tokens[token]) {
    return res.json({ status: "invalid token" });
  }

  if (tokens[token].approved.includes(device)) {
    return res.json({ status: "approved" });
  }

  res.json({ status: "pending" });
});

// REQUEST APPROVAL
app.post("/request", (req, res) => {
  const { token, device } = req.body;

  if (!tokens[token]) {
    return res.json({ status: "invalid token" });
  }

  if (
    tokens[token].pending.includes(device) ||
    tokens[token].approved.includes(device)
  ) {
    return res.json({ status: "already exists" });
  }

  tokens[token].pending.push(device);
  res.json({ status: "request stored" });
});

// 🔍 GET PENDING DEVICES (for admin UI)
app.get("/pending/:token", (req, res) => {
  const { token } = req.params;

  if (!tokens[token]) return res.json([]);

  res.json(
    tokens[token].pending.map(d => ({
      device: d
    }))
  );
});


// ✅ APPROVE DEVICE
app.post("/approve", (req, res) => {
  const { token, device } = req.body;

  if (!tokens[token]) {
    return res.json({ status: "invalid token" });
  }

  tokens[token].pending = tokens[token].pending.filter(d => d !== device);

  if (!tokens[token].approved.includes(device)) {
    tokens[token].approved.push(device);
  }

  res.json({ status: "approved" });
});

// STATIC FILES (admin panel / frontend)
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Backend is running 🟢");
});

// ❌ DO NOT app.listen() ON VERCEL
module.exports = app;
