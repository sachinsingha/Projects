// FormBuilder.jsx (Fully Updated with GPT Field Generator)
import React, { useState, useEffect, useCallback } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FieldItem from "./FieldItem";
import FieldPalette from "./FieldPalette";
import { Sun, Moon, Eye, Pencil, ArrowLeftRight, Sparkles } from "lucide-react";

export default function FormBuilder() {
  const [formTitle, setFormTitle] = useState("");
  const [fields, setFields] = useState([]);
  const [mode, setMode] = useState("edit");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("sutraform-theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sutraform-draft");
    if (saved) {
      const { title, fields } = JSON.parse(saved);
      setFormTitle(title);
      setFields(fields);
      setHistory([{ title, fields }]);
      setHistoryIndex(0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "sutraform-draft",
      JSON.stringify({ title: formTitle, fields })
    );
  }, [formTitle, fields]);

  const saveHistory = useCallback(
    (newFields) => {
      const newHistory = [
        ...history.slice(0, historyIndex + 1),
        { title: formTitle, fields: newFields },
      ];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex, formTitle]
  );

  const undo = () => {
    if (historyIndex > 0) {
      const past = history[historyIndex - 1];
      setFields(past.fields);
      setFormTitle(past.title);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setFields(next.fields);
      setFormTitle(next.title);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    const newFields = arrayMove(fields, oldIndex, newIndex);
    setFields(newFields);
    saveHistory(newFields);
  };

  const addField = (type) => {
    const newField = {
      id: nanoid(),
      label: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      required: false,
      options: type === "dropdown" ? ["Option 1", "Option 2"] : undefined,
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    saveHistory(newFields);
  };

  const updateField = (id, updatedField) => {
    const newFields = fields.map((f) => (f.id === id ? updatedField : f));
    setFields(newFields);
    saveHistory(newFields);
  };

  const deleteField = (id) => {
    const newFields = fields.filter((f) => f.id !== id);
    setFields(newFields);
    saveHistory(newFields);
  };

  const duplicateField = (id) => {
    const original = fields.find((f) => f.id === id);
    if (original) {
      const copy = {
        ...original,
        id: nanoid(),
        label: original.label + " Copy",
      };
      const newFields = [...fields, copy];
      setFields(newFields);
      saveHistory(newFields);
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return alert("Please enter a form title.");
    if (fields.length === 0) return alert("Add at least one field before saving.");

    try {
      const res = await fetch("http://localhost:5000/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle, fields }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Form saved!");
        localStorage.removeItem("sutraform-draft");
        navigate(`/submit/${data._id}`);
      } else {
        alert("❌ Failed to save form: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Network error while saving.");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("sutraform-theme", newTheme);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return alert("Prompt is empty");
    setLoadingAi(true);
    try {
      const res = await fetch("http://localhost:5000/api/generate-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      const gptFields = (data.fields || []).map((f) => ({
        id: nanoid(),
        label: f.label,
        type: f.type,
        required: false,
        options: f.type === "dropdown" ? ["Option 1", "Option 2"] : undefined,
      }));
      const newFields = [...fields, ...gptFields];
      setFields(newFields);
      saveHistory(newFields);
      setAiPrompt("");
    } catch (err) {
      alert("❌ AI generation failed");
    }
    setLoadingAi(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full md:w-64 h-auto md:h-full overflow-y-auto border-b md:border-r dark:border-zinc-700 p-4 bg-gray-100 dark:bg-zinc-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-purple-600">SutraForm</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-sm hover:text-purple-500">
                ←
              </button>
            </div>
            <FieldPalette onAddField={addField} />

            {/* AI Generator */}
            <div className="mt-6">
              <label className="text-sm font-medium">AI Field Generator</label>
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g. Contact form for job application"
                className="w-full mt-1 p-2 border border-gray-300 rounded dark:bg-zinc-700 dark:border-zinc-600"
              />
              <button
                onClick={generateWithAI}
                disabled={loadingAi}
                className="mt-2 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> {loadingAi ? "Generating..." : "Generate with AI"}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ArrowLeftRight className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enter form title"
              className="text-lg font-bold px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded w-64 sm:w-80"
              required
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              {mode === "edit" ? <Eye className="w-4 h-4 inline" /> : <Pencil className="w-4 h-4 inline" />} {mode === "edit" ? "Preview" : "Edit"}
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-2 py-1 text-xs bg-gray-200 dark:bg-zinc-700 rounded disabled:opacity-50"
            >
              Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-2 py-1 text-xs bg-gray-200 dark:bg-zinc-700 rounded disabled:opacity-50"
            >
              Redo
            </button>
          </div>
        </div>

        <div className="mt-4 border-dashed border-2 p-4 rounded dark:border-zinc-600 min-h-[200px]">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.length === 0 ? (
                <p className="text-center text-gray-500">Add fields from the left palette or generate with AI</p>
              ) : (
                fields.map((field) => (
                  <motion.div layout key={field.id} className="mb-4">
                    <FieldItem
                      field={field}
                      onUpdate={updateField}
                      onDelete={deleteField}
                      onDuplicate={duplicateField}
                    />
                  </motion.div>
                ))
              )}
            </SortableContext>
          </DndContext>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={fields.length === 0}
            className={`px-6 py-2 rounded text-white ${
              fields.length ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save Form
          </button>
        </div>
      </main>
    </div>
  );
}
