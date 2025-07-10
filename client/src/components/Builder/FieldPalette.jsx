// src/components/Builder/FieldPalette.jsx
import { Plus } from "lucide-react";

const fieldTypes = [
  { type: "text", label: "Text Field" },
  { type: "email", label: "Email Field" },
  { type: "number", label: "Number Field" },
  { type: "longtext", label: "Paragraph Text" },
  { type: "checkbox", label: "Checkbox" },
  { type: "dropdown", label: "Dropdown" },
  { type: "date", label: "Date Picker" },
  { type: "rating", label: "Rating" },
  { type: "file", label: "File Upload" },
];

export default function FieldPalette({ onAddField }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Field Palette
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
        {fieldTypes.map((field, index) => (
          <button
            key={index}
            onClick={() => onAddField(field.type)}
            className="w-full flex items-center justify-between px-4 py-2 rounded bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 hover:bg-purple-100 dark:hover:bg-zinc-600 transition text-sm sm:text-xs text-left"
          >
            <span>{field.label}</span>
            <Plus className="w-4 h-4 text-purple-600" />
          </button>
        ))}
      </div>
    </div>
  );
}
