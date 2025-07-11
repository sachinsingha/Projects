// src/pages/ResponseDashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0"];

export default function ResponseDashboard() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [formRes, respRes] = await Promise.all([
        fetch(`http://localhost:5000/api/forms/${formId}`),
        fetch(`http://localhost:5000/api/responses/${formId}`),
      ]);
      const formData = await formRes.json();
      const respData = await respRes.json();
      setForm(formData);
      setResponses(respData);
    }
    fetchData();
  }, [formId]);

  const handleExportCSV = () => {
    const data = responses.map((r) => {
      const row = {};
      form.fields.forEach((f) => {
        row[f.label] = r.responses[f.id] ?? r.responses[f._id] ?? "";
      });
      row["Submitted At"] = new Date(r.createdAt).toLocaleString();
      return row;
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${form.title}_responses.csv`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Responses - ${form.title}`, 14, 20);

    const head = [...form.fields.map((f) => f.label), "Submitted At"];
    const body = responses.map((r) => {
      return form.fields.map((f) => r.responses[f.id] ?? r.responses[f._id] ?? "").concat(
        new Date(r.createdAt).toLocaleString()
      );
    });

    autoTable(doc, {
      startY: 30,
      head: [head],
      body: body,
    });

    doc.save(`${form.title}_responses.pdf`);
  };

  const getChartData = (field) => {
    const counts = {};
    responses.forEach((r) => {
      const value = r.responses[field.id] ?? r.responses[field._id];
      if (value) counts[value] = (counts[value] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: key,
      value,
    }));
  };

  if (!form) return <p className="text-center mt-10">⏳ Loading dashboard...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Response Dashboard: {form.title}</h2>

      <div className="flex gap-3 mb-4">
        <button onClick={handleExportCSV} className="bg-yellow-500 px-4 py-2 rounded text-white">Export CSV</button>
        <button onClick={handleExportPDF} className="bg-red-600 px-4 py-2 rounded text-white">Export PDF</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              {form.fields.map((f) => (
                <th key={f.id || f._id} className="p-2 border">{f.label}</th>
              ))}
              <th className="p-2 border">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                {form.fields.map((f) => (
                  <td key={f.id || f._id} className="p-2 border">
                    {String(r.responses[f.id] ?? r.responses[f._id] ?? "")}
                  </td>
                ))}
                <td className="p-2 border">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <h3 className="text-lg font-semibold mb-2">📈 Charts</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {form.fields
          .filter((f) => f.type === "dropdown" || f.type === "rating")
          .map((f, i) => {
            const data = getChartData(f);
            return (
              <div key={i} className="border p-4 rounded shadow bg-white">
                <h4 className="font-medium mb-2">{f.label}</h4>
                {f.type === "dropdown" ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
