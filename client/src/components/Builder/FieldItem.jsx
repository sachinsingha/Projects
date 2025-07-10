// src/components/Builder/FieldItem.jsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { File, Star, Copy, Trash2 } from "lucide-react";

export default function FieldItem({ field, onUpdate, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleLabelChange = (e) => {
    onUpdate(field.id, { ...field, label: e.target.value });
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="p-4 mb-4 border rounded bg-white dark:bg-zinc-800 shadow-sm cursor-move transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <input
          type="text"
          value={field.label}
          onChange={handleLabelChange}
          placeholder="Field Label"
          className="font-medium text-base sm:text-lg border-b focus:outline-none focus:border-purple-500 dark:bg-transparent dark:text-white w-full sm:w-auto"
          aria-label="Field Label"
        />
        <div className="flex gap-2 text-gray-500 dark:text-gray-300 text-sm">
          <button
            onClick={() => onDuplicate(field.id)}
            title="Duplicate"
            aria-label="Duplicate Field"
            className="hover:text-purple-600"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(field.id)}
            title="Delete"
            aria-label="Delete Field"
            className="hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Field Preview */}
      {field.type === "longtext" ? (
        <textarea
          disabled
          placeholder={`Enter ${field.label}`}
          rows={3}
          className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700"
        />
      ) : field.type === "dropdown" ? (
        <select
          disabled
          className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700"
        >
          {(field.options || []).map((opt, i) => (
            <option key={i}>{opt}</option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center space-x-2">
          <input type="checkbox" disabled />
          <span>{field.label}</span>
        </label>
      ) : field.type === "rating" ? (
        <div className="flex gap-1 text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400" />
          ))}
        </div>
      ) : field.type === "file" ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
          <File className="w-5 h-5" />
          <span className="text-sm">Upload file (disabled)</span>
        </div>
      ) : (
        <input
          type={field.type}
          disabled
          placeholder={`Enter ${field.label}`}
          className="w-full border px-3 py-2 rounded bg-gray-100 dark:bg-zinc-700"
        />
      )}
    </div>
  );
}
