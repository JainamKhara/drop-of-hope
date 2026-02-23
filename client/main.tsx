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

console.log("Clerk Key Status:", {
  exists: !!PUBLISHABLE_KEY,
  length: PUBLISHABLE_KEY?.length,
  startsWithPk: PUBLISHABLE_KEY?.startsWith("pk_"),
  isValid: isValidClerkKey,
  isBlacklisted: PUBLISHABLE_KEY
    ? INVALID_KEYS.includes(PUBLISHABLE_KEY)
    : false,
  preview: PUBLISHABLE_KEY ? PUBLISHABLE_KEY.slice(0, 20) + "..." : "None",
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("❌ Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);

// Render app
if (isValidClerkKey) {
  console.log("✅ Using Clerk authentication");
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
    </React.StrictMode>
  );
} else {
  console.warn("⚠️ Invalid or missing Clerk key - running without Clerk");
  console.warn(
    "Get a valid key from: https://dashboard.clerk.com/last-active?path=api-keys"
  );
  console.warn("Current key:", PUBLISHABLE_KEY || "Not set");

  if (PUBLISHABLE_KEY && INVALID_KEYS.includes(PUBLISHABLE_KEY)) {
    console.warn("❌ This key is known invalid/expired. Please get a new one.");
  }

  console.log(`
🚀 To enable donor authentication:
1. Visit: https://dashboard.clerk.com
2. Create/sign in to your account
3. Create a new application
4. Copy the Publishable Key
5. Set VITE_CLERK_PUBLISHABLE_KEY in .env
6. Restart the dev server

📝 Running in fallback mode until Clerk is configured.
✅ Admin and Hospital logins (Supabase) still work.
  `);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
