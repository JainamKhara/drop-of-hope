import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css";

// Fallback main file without Clerk
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);
root.render(<App />);
