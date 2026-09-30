import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Global listener for resource load errors
window.addEventListener(
  "error",
  function (event) {
    const target = event.target || event.srcElement;

    if (target && (target.src || target.href)) {
      const url = target.src || target.href;

      console.error("Resource failed to load:", url);

      // TODO: replace console.error with your tracking endpoint or analytics call
    }
  },
  true,
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

reportWebVitals();
