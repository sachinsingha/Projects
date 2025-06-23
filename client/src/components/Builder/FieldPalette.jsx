// FieldPalette.jsx
const fieldTypes = [
  { type: "text", label: "Text Field" },
  { type: "email", label: "Email Field" },
  { type: "checkbox", label: "Checkbox" },
];

export default function FieldPalette({ onAddField }) {
  return (
    <div className="w-64 bg-white p-4 shadow-md rounded-md">
      <h3 className="font-semibold text-lg mb-4">Field Palette</h3>
      {fieldTypes.map((field, index) => (
        <button
          key={index}
          onClick={() => onAddField(field.type)}
          className="w-full bg-blue-500 text-white py-2 px-3 rounded mb-2 hover:bg-blue-600 transition"
        >
          + Add {field.label}
        </button>
      ))}
    </div>
  );
}
