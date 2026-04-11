import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleSendUrgentNotification,
  handleBroadcastNotification,
  handleRunScheduledReminders,
} from "./routes/notifications";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Notification routes
  app.post("/api/notifications/urgent", handleSendUrgentNotification);
  app.post("/api/notifications/broadcast", handleBroadcastNotification);
  app.post("/api/notifications/send-reminders", handleRunScheduledReminders);

  return app;
}
