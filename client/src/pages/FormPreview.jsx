import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function FormPreview() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/forms/${id}`);
        const data = await res.json();
        setForm(data);
      } catch (error) {
        console.error("Failed to load form", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (loading) return <p className="text-center">⏳ Loading...</p>;
  if (!form) return <p className="text-center text-red-600">❌ Form not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
      <div className="space-y-4">
        {form.fields.map((field) => (
          <div key={field.id}>
            <label className="block font-medium">{field.label}</label>
            <input
              type={field.type}
              disabled
              className="mt-1 w-full p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
