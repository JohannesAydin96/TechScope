/**
 * Entry point for the TechScope frontend.
 *
 * Loads global styles and initializes the React application
 * within React Strict Mode.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);