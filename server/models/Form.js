import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  id: String,
  label: String,
  type: String,
});

const formSchema = new mongoose.Schema({
  title: String,
  fields: [fieldSchema],
}, { timestamps: true });

export default mongoose.model("Form", formSchema);
