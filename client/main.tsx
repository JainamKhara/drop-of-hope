import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./global.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

console.log("Clerk Key:", PUBLISHABLE_KEY?.slice(0, 20) + "...");
console.log("Environment:", import.meta.env.MODE);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);
root.render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      baseTheme: undefined,
      variables: {
        colorPrimary: "#dc2626", // hope-red color
      },
    }}
  >
    <App />
  </ClerkProvider>
);
