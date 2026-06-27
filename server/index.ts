import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleSendUrgentNotification,
  handleBroadcastNotification,
  handleRunScheduledReminders,
} from "./routes/notifications";
import { handleCreateAppointment } from "./routes/appointments";
import { handleAcceptAppointment, handleMarkDonationComplete, handleNoShowAppointment } from "./routes/hospitalActions";
import { handleApproveDonor } from "./routes/adminActions";
import { handleChatbotQuery } from "./routes/chatbot";
import { startAppointmentReminderJob } from "./jobs/appointmentReminders";
import { startExpirationJob, runExpirationChecks } from "./jobs/expirationJob";

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

  // Appointment routes
  app.post("/api/appointments", handleCreateAppointment);
  app.post("/api/appointments/:id/accept", handleAcceptAppointment);
  app.post("/api/appointments/:id/complete", handleMarkDonationComplete);
  app.post("/api/appointments/:id/no-show", handleNoShowAppointment);
  app.post("/api/chatbot", handleChatbotQuery);

  // Manual expiration trigger (for admin use)
  app.post("/api/admin/run-expiration", async (_req, res) => {
    try {
      await runExpirationChecks();
      res.json({ success: true, message: "Expiration checks completed" });
    } catch (err) {
      res.status(500).json({ error: "Expiration check failed" });
    }
  });

  app.post("/api/admin/donors/:id/approve", handleApproveDonor);


  // Initialize background jobs
  startAppointmentReminderJob();
  startExpirationJob();

  return app;
}
