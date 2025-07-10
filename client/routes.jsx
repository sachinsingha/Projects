// src/routes.jsx
import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import FormBuilder from "./components/FormBuilder";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/builder",
    element: <FormBuilder />,
  },
]);

export default router;
