import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Parser } from "json2csv";

import Form from "./models/Form.js";
import Response from "./models/Response.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// 🔑 OpenAI Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🧱 Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use((req, _, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// 🔌 MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ==============================
// 🔹 API ROUTES
// ==============================

// Create a new form
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
    console.error("❌ Error creating form:", err);
    res.status(500).json({ error: "Failed to save form" });
  }
});

// Get a form by ID
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

// Submit form response
app.post("/api/responses/:formId", async (req, res) => {
  try {
    const { responses } = req.body;
    if (!responses || typeof responses !== "object") {
      return res.status(400).json({ error: "Invalid response data" });
    }

    const responseDoc = new Response({ formId: req.params.formId, responses });
    await responseDoc.save();
    res.status(201).json({ message: "Response saved" });
  } catch (err) {
    console.error("❌ Error saving response:", err);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// Get all responses for a form
app.get("/api/responses/:formId", async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    console.error("❌ Error fetching responses:", err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// Export responses to CSV
app.get("/api/responses/:formId/csv", async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId });
    if (!responses.length) return res.status(404).json({ error: "No responses found" });

    const formatted = responses.map(r => ({
      ...r.responses,
      createdAt: r.createdAt,
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment("responses.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ Error exporting CSV:", err);
    res.status(500).json({ error: "CSV export failed" });
  }
});

// Generate fields using GPT
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
        content: `Generate JSON form fields for: "${prompt}". Return an array of objects with "label" and "type" (text, email, number, checkbox).`,
      }],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json({ fields: parsed });
  } catch (err) {
    console.error("❌ GPT generation error:", err);
    res.status(500).json({ error: "Failed to generate fields" });
  }
});

// ==============================
// 🔸 Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
