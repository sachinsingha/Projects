import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormBuilder from "./components/Builder/FormBuilder";
import FormPreview from "./pages/FormPreview";
import FormSubmit from "./pages/FormSubmit";
import FormResponses from "./pages/FormResponses";


function App() {
  return (
    <Router>
      <main className="min-h-screen bg-gray-100 p-6">
        <Routes>
          <Route path="/" element={<FormBuilder />} />
          <Route path="/form/:id" element={<FormPreview />} />
          <Route path="/submit/:formId" element={<FormSubmit />} />
          <Route path="/responses/:formId" element={<FormResponses />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
