// src/pages/FormSubmit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import Papa from "papaparse";

export default function FormSubmit() {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

  const handleChange = (id, value) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validateField = (field, value) => {
    if (field.required && !value) return "This field is required.";
    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email.";
    }
    if (field.label.toLowerCase().includes("phone")) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) return "Please enter a valid 10-digit phone number.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let hasError = false;

    form.fields.forEach((field, i) => {
      const id = field.id || field._id || `field-${i}`;
      const errorMsg = validateField(field, responses[id]);
      if (errorMsg) {
        newErrors[id] = errorMsg;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/responses/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, formTitle: form.title }),
      });

      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("❌ Failed to submit form.");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Form Title: ${form.title}`, 14, 20);

    const rows = Object.entries(responses).map(([id, val], i) => {
      const label = form.fields.find((f) => f.id === id || f._id === id)?.label || id;
      return [label, typeof val === "object" ? JSON.stringify(val) : val];
    });

    autoTable(doc, {
      startY: 30,
      head: [["Field", "Response"]],
      body: rows,
    });

    doc.save(`${form.title.replace(/\s+/g, "_")}_response.pdf`);
  };

  const handleExportCSV = () => {
    const row = {};
    form.fields.forEach((f) => {
      const id = f.id || f._id;
      const val = responses[id];
      row[f.label] = typeof val === "object" ? JSON.stringify(val) : val;
    });

    const csv = Papa.unparse([row]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${form.title.replace(/\s+/g, "_")}_response.csv`);
  };

  if (!form) return <p className="text-center mt-10">⏳ Loading form...</p>;

  if (submitted)
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-zinc-800 shadow-lg rounded text-center">
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4">
          ✅ Response submitted!
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-6">
          <button onClick={() => setSubmitted(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Fill Again</button>
          <button onClick={() => navigate("/")} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Back to Home</button>
          <button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Export PDF</button>
          <button onClick={handleExportCSV} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">Export CSV</button>
        </div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-800 shadow-md rounded">
      <div className="mb-6">
        <label className="block font-semibold mb-1">Form Title</label>
        <input
          type="text"
          value={form.title}
          readOnly
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {form.fields.map((field, i) => {
          const id = field.id || field._id || `field-${i}`;
          const value = responses[id];

          return (
            <div key={id}>
              <label className="block font-medium mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "longtext" ? (
                <textarea rows={3} value={value} onChange={(e) => handleChange(id, e.target.value)} required={field.required} className="w-full p-2 border border-gray-300 rounded" />
              ) : field.type === "dropdown" ? (
                <select value={value} onChange={(e) => handleChange(id, e.target.value)} required={field.required} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">-- Select --</option>
                  {field.options?.map((opt, index) => <option key={index} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === "checkbox" ? (
                <input type="checkbox" checked={value || false} onChange={(e) => handleChange(id, e.target.checked)} className="h-5 w-5" />
              ) : field.type === "rating" ? (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`cursor-pointer text-2xl ${value >= star ? "text-yellow-400" : "text-gray-300"}`} onClick={() => handleChange(id, star)}>★</span>
                  ))}
                </div>
              ) : field.type === "file" ? (
                <input type="file" onChange={(e) => handleChange(id, e.target.files?.[0] || "")} required={field.required} className="w-full" />
              ) : (
                <input type={field.type} value={value} onChange={(e) => handleChange(id, e.target.value)} required={field.required} className="w-full p-2 border border-gray-300 rounded" />
              )}

              {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id]}</p>}
            </div>
          );
        })}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
      </form>
    </div>
  );
}
