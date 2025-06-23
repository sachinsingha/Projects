import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FormSubmit() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch form by ID
  useEffect(() => {
    fetch(`http://localhost:5000/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        const defaultValues = {};
        data.fields.forEach((f, i) => {
          const id = f.id || f._id || `field-${i}`;
          defaultValues[id] = f.type === "checkbox" ? false : "";
        });
        setResponses(defaultValues);
      })
      .catch((err) => {
        console.error("Failed to load form:", err);
        alert("❌ Failed to load form.");
      });
  }, [formId]);

  // Handle input changes
  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  // Handle submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/responses/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Failed to submit response.");
    }
  };

  if (!form) return <p className="text-center mt-10">⏳ Loading form...</p>;

  if (submitted)
    return (
      <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">✅ Response submitted!</h2>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
        >
          Fill Again
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Back to Home
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">{form.title || "Untitled Form"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map((field, i) => {
          const id = field.id || field._id || `field-${i}`;
          const value = responses[id];

          return (
            <div key={id}>
              <label className="block font-medium mb-1">{field.label}</label>
              {field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => handleChange(id, e.target.checked)}
                  className="h-5 w-5"
                />
              ) : (
                <input
                  type={field.type}
                  value={value || ""}
                  onChange={(e) => handleChange(id, e.target.value)}
                  required={field.required}
                  pattern={field.type === "email" ? "[^\\s@]+@[^\\s@]+\\.[^\\s@]+" : undefined}
                  className="mt-1 w-full p-2 border border-gray-300 rounded"
                />
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
