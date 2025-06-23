import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import FieldItem from "./FieldItem";
import FieldPalette from "./FieldPalette";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";

export default function FormBuilder() {
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [fields, setFields] = useState([]);
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    setFields(arrayMove(fields, oldIndex, newIndex));
  };

  const addField = (type) => {
    const newField = {
      id: nanoid(),
      label: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      required: false,
    };
    setFields((prev) => [...prev, newField]);
  };

  const updateField = (id, updatedField) => {
    setFields((prev) => prev.map((f) => (f.id === id ? updatedField : f)));
  };

  const deleteField = (id) => {
    const confirmDelete = window.confirm("❗ Are you sure you want to delete this field?");
    if (confirmDelete) {
      setFields((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const duplicateField = (id) => {
    const original = fields.find((f) => f.id === id);
    if (original) {
      const copy = {
        ...original,
        id: nanoid(),
        label: original.label + " Copy",
      };
      setFields((prev) => [...prev, copy]);
    }
  };

  const handleGptGenerate = async () => {
    if (!prompt.trim()) return alert("⚠️ Please enter a prompt.");
    try {
      const res = await fetch("http://localhost:5000/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (res.ok && data.fields) {
        setFields(data.fields);
        setFormTitle(data.title || "AI Generated Form");
      } else {
        alert("❌ Failed to generate form.");
      }
    } catch (err) {
      console.error("AI generation error:", err);
      alert("❌ Error generating form.");
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      alert("🚨 Please enter a form title.");
      return;
    }

    if (fields.length === 0) {
      alert("🚨 Add at least one field before saving.");
      return;
    }

    const payload = {
      title: formTitle,
      fields,
    };

    try {
      const res = await fetch("http://localhost:5000/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Form saved!`);
        navigate(`/submit/${data._id}`);
      } else {
        alert("❌ Failed to save form: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("❌ Network error while saving.");
    }
  };

  return (
    <div className="flex gap-4">
      <FieldPalette onAddField={addField} />

      <div className="flex-1 p-4 bg-gray-50 rounded-md shadow-inner">
        {/* AI Prompt Input Section */}
        <div className="mb-4 flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your form (e.g., Feedback Form)"
            className="flex-1 border border-gray-300 p-2 rounded"
          />
          <button
            onClick={handleGptGenerate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            ✨ Generate with AI
          </button>
        </div>

        {/* Form Title + Save */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Form Title"
            className="text-xl font-semibold px-3 py-2 border border-gray-300 rounded w-full max-w-md"
          />
          <button
            onClick={handleSave}
            disabled={fields.length === 0}
            className={`ml-4 px-4 py-2 rounded text-white shadow ${
              fields.length
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            💾 Save Form
          </button>
        </div>

        {/* Field List */}
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field) => (
              <FieldItem
                key={field.id}
                field={field}
                onUpdate={updateField}
                onDelete={deleteField}
                onDuplicate={duplicateField}
              />
            ))}
          </SortableContext>
        </DndContext>

        {fields.length === 0 && (
          <p className="text-gray-500 mt-4 text-center">Add fields to start building your form.</p>
        )}
      </div>
    </div>
  );
}
