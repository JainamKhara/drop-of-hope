import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./global.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if key exists and looks valid (starts with pk_)
const isValidClerkKey =
  PUBLISHABLE_KEY &&
  PUBLISHABLE_KEY.startsWith("pk_") &&
  PUBLISHABLE_KEY.length > 20 &&
  !PUBLISHABLE_KEY.includes("__") && // Not placeholder
  PUBLISHABLE_KEY !== "pk_test_dHJ1c3RlZC1jcmFuZS01NC5jbGVyay5hY2NvdW50cy5kZXY"; // Not the invalid key

console.log("Clerk Key Status:", {
  exists: !!PUBLISHABLE_KEY,
  length: PUBLISHABLE_KEY?.length,
  startsWithPk: PUBLISHABLE_KEY?.startsWith("pk_"),
  isValid: isValidClerkKey,
  preview: PUBLISHABLE_KEY?.slice(0, 20) + "...",
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

// Render with or without Clerk based on key validity
if (isValidClerkKey) {
  console.log("✅ Using Clerk authentication");
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
    </ClerkProvider>,
  );
} else {
  console.warn(
    "⚠️ Invalid or missing Clerk key - running without Clerk authentication",
  );
  console.warn(
    "Please get a valid key from: https://dashboard.clerk.com/last-active?path=api-keys",
  );
  root.render(<App />);
}
