import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
      className="p-4 mb-2 border rounded bg-white shadow-sm cursor-move relative"
    >
      <div className="flex items-center justify-between mb-2">
        <input
          type="text"
          value={field.label}
          onChange={handleLabelChange}
          className="font-medium text-lg border-b focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-2 text-gray-500 text-sm">
          <button onClick={() => onDuplicate(field.id)} title="Duplicate">📄</button>
          <button onClick={() => onDelete(field.id)} title="Delete">🗑️</button>
        </div>
      </div>
      <input
        type={field.type}
        disabled
        placeholder={`Enter ${field.label}`}
        className="w-full border px-2 py-1 rounded bg-gray-100"
      />
    </div>
  );
}
