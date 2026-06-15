import React from "react";
import ReactDOM from "react-dom/client";
import App from "./FitTrack.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { installGlobalErrorReporting } from "./error-reporting.js";

installGlobalErrorReporting();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
