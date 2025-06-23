import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    responses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export default mongoose.model("Response", responseSchema);
