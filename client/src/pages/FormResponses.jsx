import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function FormResponses() {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [formTitle, setFormTitle] = useState("");

  useEffect(() => {
    // Fetch responses
    fetch(`http://localhost:5000/api/responses/${formId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch responses");
        return res.json();
      })
      .then(setResponses)
      .catch((err) => {
        console.error("Error fetching responses:", err);
        alert("❌ Failed to load responses");
      });

    // Optional: Fetch form title
    fetch(`http://localhost:5000/api/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => setFormTitle(data.title || "Form Responses"))
      .catch(() => setFormTitle("Form Responses"));
  }, [formId]);

  const exportToCSV = () => {
    if (responses.length === 0) return;

    const headers = Object.keys(responses[0].responses);
    const csvRows = [
      ["S.No", "Submitted At", ...headers],
      ...responses.map((r, i) => [
        i + 1,
        new Date(r.createdAt).toLocaleString(),
        ...headers.map((h) => JSON.stringify(r.responses[h] || ""))
      ]),
    ];

    const csvString = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${formTitle.replace(/\s+/g, "_").toLowerCase()}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (responses.length === 0) {
    return (
      <p className="text-center mt-10 text-gray-600">
        ⏳ No responses found yet.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          📋 {formTitle || "Submitted Responses"}
        </h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ⬇️ Export to CSV
        </button>
      </div>

      <div className="space-y-6">
        {responses.map((res, i) => (
          <div key={res._id} className="border p-4 rounded bg-gray-50">
            <h4 className="font-bold mb-2">📝 Response {i + 1}</h4>
            <p className="text-sm text-gray-500 mb-2">
              Submitted At: {new Date(res.createdAt).toLocaleString()}
            </p>
            {Object.entries(res.responses).map(([key, value]) => (
              <p key={key} className="mb-1">
                <strong>{key}:</strong> {value?.toString?.()}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
