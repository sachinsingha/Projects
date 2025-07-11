import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { saveAs } from "file-saver";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

export default function FormAnalytics() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/forms/${formId}`)
      .then((res) => res.json())
      .then(setForm)
      .catch((err) => console.error("Error fetching form:", err));

    fetch(`http://localhost:5000/api/responses/${formId}`)
      .then((res) => res.json())
      .then(setResponses)
      .catch((err) => console.error("Error fetching responses:", err));
  }, [formId]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Analytics: ${form?.title}`, 14, 20);

    const tableRows = responses.map((r) => {
      return Object.values(r.responses).map((val) =>
        typeof val === "object" ? JSON.stringify(val) : val
      );
    });

    autoTable(doc, {
      startY: 30,
      head: [form.fields.map((f) => f.label)],
      body: tableRows,
    });

    doc.save(`${form?.title || "form"}_analytics.pdf`);
  };

  const handleExportCSV = () => {
    const data = responses.map((r) => {
      const row = {};
      form.fields.forEach((f) => {
        row[f.label] = r.responses[f.id || f._id] || "";
      });
      return row;
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${form?.title || "form"}_analytics.csv`);
  };

  const getChartData = (field) => {
    const counts = {};
    responses.forEach((r) => {
      const val = r.responses[field.id || field._id];
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({ name: key, value }));
  };

  if (!form) return <p className="text-center mt-10">⏳ Loading analytics...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Analytics: {form.title}</h1>

      <div className="mb-6 flex gap-4">
        <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded">Export PDF</button>
        <button onClick={handleExportCSV} className="bg-yellow-500 text-white px-4 py-2 rounded">Export CSV</button>
      </div>

      <h2 className="text-xl font-semibold mb-3">📥 Submissions Table</h2>
      <div className="overflow-x-auto mb-10">
        <table className="min-w-full table-auto border border-gray-300">
          <thead>
            <tr>
              {form.fields.map((f) => (
                <th key={f.id} className="border px-2 py-1 bg-gray-100">{f.label}</th>
              ))}
              <th className="border px-2 py-1 bg-gray-100">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((res, idx) => (
              <tr key={idx} className="text-sm">
                {form.fields.map((f) => (
                  <td key={f.id} className="border px-2 py-1">
                    {typeof res.responses[f.id || f._id] === "object"
                      ? JSON.stringify(res.responses[f.id || f._id])
                      : res.responses[f.id || f._id] || "-"}
                  </td>
                ))}
                <td className="border px-2 py-1 text-xs">
                  {new Date(res.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form.fields
        .filter((f) => f.type === "dropdown" || f.type === "rating")
        .map((f, i) => {
          const chartData = getChartData(f);
          return (
            <div key={f.id} className="mb-12">
              <h3 className="font-semibold mb-2">📈 {f.label}</h3>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} fill="#82ca9d" label>
                        {chartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
