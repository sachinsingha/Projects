import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FormDashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/forms")
      .then((res) => res.json())
      .then((data) => {
        setForms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching forms:", err);
        alert("Failed to load forms.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Your Forms Dashboard</h1>

      {loading ? (
        <p>⏳ Loading forms...</p>
      ) : forms.length === 0 ? (
        <p>No forms found. Create one to get started!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form._id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{form.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                Created: {new Date(form.createdAt).toLocaleString()}
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  to={`/submit/${form._id}`}
                  className="text-blue-600 hover:underline"
                >
                  🔗 Public Form Link
                </Link>
                <Link
                  to={`/responses/${form._id}`}
                  className="text-green-600 hover:underline"
                >
                  📥 View Submissions
                </Link>
                <Link
                  to={`/dashboard/${form._id}`}
                  className="text-purple-600 hover:underline"
                >
                  📊 View Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
