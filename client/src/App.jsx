import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormBuilder from "./components/Builder/FormBuilder";
import FormPreview from "./pages/FormPreview";
import FormSubmit from "./pages/FormSubmit";
import FormResponses from "./pages/FormResponses";
import FormDashboard from "./pages/FormDashboard";
import LandingPage from "./pages/LandingPage";
import ResponseDashboard from "./pages/ResponseDashboard";



function App() {
  return (
    <Router>
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/builder" element={<FormBuilder />} />
          <Route path="/form/:id" element={<FormPreview />} />
          <Route path="/submit/:formId" element={<FormSubmit />} />
          <Route path="/responses/:formId" element={<FormResponses />} />
          <Route path="/dashboard" element={<FormDashboard />} />
          <Route path="/dashboard/:formId" element={<ResponseDashboard />} />
          

        </Routes>
      </main>
    </Router>
  );
}

export default App;
