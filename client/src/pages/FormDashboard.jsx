import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FormDashboard() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/forms")
      .then((res) => res.json())
      .then(setForms)
      .catch((err) => {
        console.error("❌ Error fetching forms:", err);
        alert("Failed to load forms.");
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Your Forms</h1>

      {forms.length === 0 ? (
        <p>No forms found. Start building one!</p>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => (
            <div
              key={form._id}
              className="p-4 border rounded shadow bg-white"
            >
              <h2 className="text-lg font-semibold">{form.title}</h2>
              <p className="text-sm text-gray-500">
                Created: {new Date(form.createdAt).toLocaleString()}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <Link
                  to={`/submit/${form._id}`}
                  className="text-blue-600 hover:underline"
                >
                  🔗 Submit Link
                </Link>
                <Link
                  to={`/responses/${form._id}`}
                  className="text-green-600 hover:underline"
                >
                  📊 View Responses
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
