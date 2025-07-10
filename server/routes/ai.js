// routes/ai.js
import express from "express";
import OpenAI from "openai";
import Response from "../models/Response.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get("/:formId", async (req, res) => {
  try {
    const formId = req.params.formId;
    const responses = await Response.find({ formId });

    if (!responses.length) {
      return res.status(404).json({ error: "No responses found." });
    }

    const prompt = `
Analyze these form responses. Give overall sentiment, common keywords, and a short summary:\n
${JSON.stringify(responses.map(r => r.responses), null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = completion.choices[0].message.content;
    res.json({ summary });
  } catch (err) {
    console.error("❌ AI analysis error:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

export default router; // ✅ use ESM export
