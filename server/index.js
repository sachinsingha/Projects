import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

import Form from "./models/Form.js";
import Response from "./models/Response.js";

dotenv.config();
const app = express();

// OpenAI instance
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// MongoDB Connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Log requests
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ==============================
// 🔹 ROUTES
// ==============================

// 1. Create a new form
app.post("/api/forms", async (req, res) => {
  try {
    const { title, fields } = req.body;
    if (!title || !Array.isArray(fields)) {
      return res.status(400).json({ error: "Invalid form data" });
    }

    const form = new Form({ title, fields });
    const saved = await form.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Failed to save form:", err);
    res.status(500).json({ error: "Failed to save form" });
  }
});

// 2. Get a form by ID
app.get("/api/forms/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    console.error("❌ Error fetching form:", err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// 3. Submit form response
app.post("/api/responses/:formId", async (req, res) => {
  try {
    const { responses } = req.body;
    const { formId } = req.params;

    if (!formId || !responses || typeof responses !== "object") {
      return res.status(400).json({ error: "Invalid response data" });
    }

    const responseDoc = new Response({ formId, responses });
    await responseDoc.save();

    res.status(201).json({ message: "Response saved" });
  } catch (err) {
    console.error("❌ Failed to save response:", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// 4. View all responses for a form (Admin)
app.get("/api/responses/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const responses = await Response.find({ formId }).sort({ createdAt: -1 });
    res.status(200).json(responses);
  } catch (err) {
    console.error("❌ Failed to fetch responses:", err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// 5. Generate fields using GPT (🧠 AI-based form generation)
app.post("/api/generate-fields", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Generate JSON form fields for: "${prompt}". 
Return an array of objects with "label" and "type" (text, email, number, checkbox). Example:
[
  { "label": "Full Name", "type": "text" },
  { "label": "Email", "type": "email" }
]`
      }],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json({ fields: parsed });
  } catch (err) {
    console.error("❌ GPT error:", err);
    res.status(500).json({ error: "Failed to generate fields." });
  }
});

// ==============================
// 🔸 Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
