import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { Parser } from "json2csv";

import Form from "./models/Form.js";
import Response from "./models/Response.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// 🌐 Middleware
// ------------------------
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use((req, _, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ------------------------
// 🔗 MongoDB Connection
// ------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------------
// 🔹 FORM ROUTES
// ------------------------

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

// ------------------------
// 🔸 RESPONSE ROUTES
// ------------------------

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

app.get("/api/responses/:formId", async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (err) {
    console.error("❌ Error fetching responses:", err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

app.get("/api/responses/:formId/csv", async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId });
    if (!responses.length) return res.status(404).json({ error: "No responses found" });

    const formatted = responses.map((r) => ({
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

// ------------------------
// ✨ AI Field Generator
// ------------------------

app.post("/api/generate-fields", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: `Only return a JSON array of form fields with "label" and "type" (text, email, number, checkbox). Example: [{"label":"Name","type":"text"}]. Now generate fields for: "${prompt}"`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "SutraForm AI Generator",
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) throw new Error("No content returned by AI");

    const jsonMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) throw new Error("No valid JSON array found in AI response");

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ fields: parsed });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message || "Unknown AI error";
    console.error("❌ OpenRouter GPT error:", msg);
    res.status(500).json({ error: msg });
  }
});

// ------------------------
// ✅ Server Start
// ------------------------

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
