import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: { type: [String], default: undefined }, // for dropdowns
});

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fields: [fieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Form", formSchema);
