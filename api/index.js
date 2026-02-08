const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
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
  if (!tokens[token]) return res.json({ status: "invalid token" });
  if (tokens[token].approved.includes(device)) {
    return res.json({ status: "approved" });
  }
  res.json({ status: "pending" });
});

// REQUEST APPROVAL
app.post("/request", (req, res) => {
  const { token, device } = req.body;
  if (!tokens[token]) return res.json({ status: "invalid token" });
  if (
    tokens[token].pending.includes(device) ||
    tokens[token].approved.includes(device)
  ) {
    return res.json({ status: "already exists" });
  }
  tokens[token].pending.push(device);
  res.json({ status: "request stored" });
});

// GET PENDING
app.get("/pending/:token", (req, res) => {
  const { token } = req.params;
  if (!tokens[token]) return res.json([]);
  res.json(tokens[token].pending.map(device => ({ device })));
});

// APPROVE
app.post("/approve", (req, res) => {
  const { token, device } = req.body;
  if (!tokens[token]) return res.json({ status: "invalid token" });
  tokens[token].pending = tokens[token].pending.filter(d => d !== device);
  if (!tokens[token].approved.includes(device)) {
    tokens[token].approved.push(device);
  }
  res.json({ status: "approved" });
});

// ✅ THIS IS THE CRITICAL LINE
module.exports = (req, res) => {
  app(req, res);
};
