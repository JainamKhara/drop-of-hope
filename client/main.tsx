// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./global.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// List of known invalid or expired keys
const INVALID_KEYS = [
  "pk_test_example",
  // add more test/expired keys if needed
];

// Validate the Clerk publishable key
const isValidClerkKey =
  PUBLISHABLE_KEY &&
  PUBLISHABLE_KEY.startsWith("pk_") &&
  PUBLISHABLE_KEY.length > 20 &&
  !PUBLISHABLE_KEY.includes("__") &&
  !PUBLISHABLE_KEY.includes("your_") &&
  !INVALID_KEYS.includes(PUBLISHABLE_KEY);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("❌ Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);

// Render app
if (isValidClerkKey) {
  root.render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: "#dc2626", // Hope-red
          },
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

// Register Service Worker for offline PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
      .catch((err) => console.error("Service Worker registration failed:", err));
  });
}
