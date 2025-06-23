import express from "express";
import Response from "../models/responseModel.js";

const router = express.Router();

router.post("/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const { responses } = req.body;

    const newResponse = new Response({
      formId,
      responses,
    });

    await newResponse.save();
    res.status(201).json({ message: "Response saved" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save response" });
  }
});

export default router;
