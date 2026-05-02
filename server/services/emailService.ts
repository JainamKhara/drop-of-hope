import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables for Gmail SMTP");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  return transporter;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const emailFromName = process.env.EMAIL_FROM_NAME || "Drop of Hope";
    const emailFromAddress = process.env.EMAIL_USER;

    const result = await getTransporter().sendMail({
      from: `"${emailFromName}" <${emailFromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`Email sent: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error("Error sending email via Gmail:", error);
    return false;
  }
};

export const sendBookingConfirmationEmail = async (
  donorEmail: string,
  donorName: string,
  driveName: string,
  location: string,
  appointmentDate: string,
  appointmentTime: string,
): Promise<boolean> => {
  const subject = "Blood Donation Appointment Confirmed";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d32f2f; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px 0; }
        .appointment-details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .detail-row { margin: 8px 0; }
        .label { font-weight: bold; color: #d32f2f; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        .button { display: inline-block; background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Appointment Confirmed</h1>
        </div>

        <div class="content">
          <p>Hi ${donorName},</p>

          <p>Thank you for scheduling your blood donation! Your appointment has been confirmed. Below are the details:</p>

          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">Blood Drive:</span> ${driveName}
            </div>
            <div class="detail-row">
              <span class="label">Location:</span> ${location}
            </div>
            <div class="detail-row">
              <span class="label">Date:</span> ${appointmentDate}
            </div>
            <div class="detail-row">
              <span class="label">Time:</span> ${appointmentTime}
            </div>
          </div>

          <p><strong>Important:</strong> Please arrive 15 minutes early to allow time for check-in and health screening.</p>

          <p>We'll send you reminder notifications:</p>
          <ul>
            <li>One day before your appointment</li>
            <li>One hour before your appointment</li>
          </ul>

          <p>If you need to reschedule or cancel, please log in to your account or contact us as soon as possible.</p>

          <a href="${process.env.APP_URL || "https://drop-of-hope.vercel.app"}/my-appointments" class="button">View My Appointments</a>

          <p>Thank you for your commitment to helping save lives!</p>

          <p>Best regards,<br>The Drop of Hope Team</p>
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply to this message. If you have questions, visit our website or contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: donorEmail,
    subject,
    html,
  });
};

export const sendReminderEmail = async (
  donorEmail: string,
  donorName: string,
  driveName: string,
  location: string,
  appointmentDate: string,
  appointmentTime: string,
  reminderType: "1_day" | "1_hour",
): Promise<boolean> => {
  const isOneDayReminder = reminderType === "1_day";
  const timeMessage = isOneDayReminder
    ? "tomorrow"
    : "in approximately one hour";
  const subject = isOneDayReminder
    ? "Reminder: Your Blood Donation is Tomorrow"
    : "Reminder: Your Blood Donation is in 1 Hour";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1976d2; color: white; padding: 20px; border-radius: 5px; }
        .content { padding: 20px 0; }
        .appointment-details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .detail-row { margin: 8px 0; }
        .label { font-weight: bold; color: #1976d2; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        .button { display: inline-block; background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Reminder</h1>
        </div>

        <div class="content">
          <p>Hi ${donorName},</p>

          <p>This is a friendly reminder that your blood donation appointment is scheduled for ${timeMessage}!</p>

          <div class="appointment-details">
            <div class="detail-row">
              <span class="label">Blood Drive:</span> ${driveName}
            </div>
            <div class="detail-row">
              <span class="label">Location:</span> ${location}
            </div>
            <div class="detail-row">
              <span class="label">Date:</span> ${appointmentDate}
            </div>
            <div class="detail-row">
              <span class="label">Time:</span> ${appointmentTime}
            </div>
          </div>

          <p><strong>Please remember to:</strong></p>
          <ul>
            <li>Arrive 15 minutes early</li>
            <li>Bring a valid photo ID and proof of address</li>
            <li>Stay hydrated and eat a healthy meal before donating</li>
            <li>Get enough sleep the night before</li>
          </ul>

          <p>If you need to reschedule or cancel, please do so as soon as possible from your account.</p>

          <a href="${process.env.APP_URL || "https://drop-of-hope.vercel.app"}/my-appointments" class="button">View Appointment Details</a>

          <p>Thank you for being a lifesaver!</p>

          <p>Best regards,<br>The Drop of Hope Team</p>
        </div>

        <div class="footer">
          <p>This is an automated email. Please do not reply to this message. If you have questions, visit our website or contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: donorEmail,
    subject,
    html,
  });
};

export const sendAcceptanceEmail = async (
  donorEmail: string,
  donorName: string,
  driveName: string,
  location: string,
  appointmentDate: string,
  appointmentTime: string,
  hospitalName: string,
): Promise<boolean> => {
  const subject = `✅ Appointment Accepted – ${driveName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d32f2f, #b71c1c); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; }
        .header p { margin: 8px 0 0; opacity: 0.9; }
        .body { background: #fff; padding: 30px; border: 1px solid #eee; }
        .detail-box { background: #fef2f2; border-left: 4px solid #d32f2f; padding: 16px 20px; border-radius: 0 6px 6px 0; margin: 20px 0; }
        .detail-row { display: flex; gap: 12px; margin: 8px 0; font-size: 15px; }
        .label { font-weight: bold; color: #d32f2f; min-width: 110px; }
        .btn { display: inline-block; background-color: #d32f2f; color: white !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .footer { color: #999; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
        .badge { display:inline-block; background:#d32f2f; color:#fff; padding:3px 12px; border-radius:20px; font-size:13px; margin-bottom:16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Accepted!</h1>
          <p>Your blood donation is confirmed by ${hospitalName}</p>
        </div>
        <div class="body">
          <p>Hi <strong>${donorName}</strong>,</p>
          <p>Great news! <strong>${hospitalName}</strong> has <strong>accepted</strong> your blood donation appointment. You are all set to save lives!</p>
          <div class="detail-box">
            <div class="detail-row"><span class="label">🏥 Blood Drive:</span> ${driveName}</div>
            <div class="detail-row"><span class="label">📍 Location:</span> ${location}</div>
            <div class="detail-row"><span class="label">📅 Date:</span> ${appointmentDate}</div>
            <div class="detail-row"><span class="label">⏰ Time:</span> ${appointmentTime}</div>
          </div>
          <p><strong>Reminders will be sent:</strong></p>
          <ul>
            <li>🔔 One day before your appointment</li>
            <li>⏱️ One hour before your appointment</li>
          </ul>
          <p><strong>Remember to bring:</strong> Valid photo ID • Stay hydrated • Eat a good meal beforehand • Arrive 15 mins early</p>
          <a href="${process.env.APP_URL || 'https://drop-of-hope.vercel.app'}/my-appointments" class="btn">View My Appointment</a>
          <p style="margin-top:24px">Thank you for your commitment to saving lives! 💗</p>
          <p>Best regards,<br><strong>The Drop of Hope Team</strong></p>
        </div>
        <div class="footer">This is an automated email. Do not reply. &copy; Drop of Hope</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: donorEmail, subject, html });
};

export const sendCompletionEmail = async (
  donorEmail: string,
  donorName: string,
  driveName: string,
  donationDate: string,
  bloodType: string,
  pointsEarned: number,
  totalDonations: number,
): Promise<boolean> => {
  const subject = `🌟 Donation Complete – Thank you, ${donorName}!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2e7d32, #1b5e20); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; }
        .body { background: #fff; padding: 30px; border: 1px solid #eee; }
        .stat-row { display: flex; gap: 0; margin: 20px 0; border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
        .stat { flex: 1; padding: 16px 10px; text-align: center; background: #f9fafb; }
        .stat-num { font-size: 26px; font-weight: bold; color: #2e7d32; }
        .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
        .detail-box { background: #f0fdf4; border-left: 4px solid #2e7d32; padding: 16px 20px; border-radius: 0 6px 6px 0; margin: 20px 0; }
        .detail-row { display: flex; gap: 12px; margin: 8px 0; font-size: 15px; }
        .label { font-weight: bold; color: #2e7d32; min-width: 110px; }
        .btn { display: inline-block; background-color: #2e7d32; color: white !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .footer { color: #999; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 Donation Complete!</h1>
          <p>You are a hero, ${donorName}!</p>
        </div>
        <div class="body">
          <p>Hi <strong>${donorName}</strong>,</p>
          <p>Your blood donation has been successfully recorded. You&apos;ve just helped save up to <strong>3 lives</strong> with a single donation. Thank you!</p>
          <div class="stat-row">
            <div class="stat"><div class="stat-num">+${pointsEarned}</div><div class="stat-label">Points Earned</div></div>
            <div class="stat"><div class="stat-num">${totalDonations}</div><div class="stat-label">Total Donations</div></div>
            <div class="stat"><div class="stat-num">${totalDonations * 3}</div><div class="stat-label">Lives Impacted</div></div>
          </div>
          <div class="detail-box">
            <div class="detail-row"><span class="label">🏥 Blood Drive:</span> ${driveName}</div>
            <div class="detail-row"><span class="label">Blood Type:</span> ${bloodType}</div>
            <div class="detail-row"><span class="label">📅 Date:</span> ${donationDate}</div>
          </div>
          <p>Your donation certificate is available in your account. View your full donation history and achievements below.</p>
          <a href="${process.env.APP_URL || 'https://drop-of-hope.vercel.app'}/my-appointments" class="btn">View Certificate &amp; History</a>
          <p style="margin-top:24px">With gratitude,<br><strong>The Drop of Hope Team</strong></p>
        </div>
        <div class="footer">This is an automated email. Do not reply. &copy; Drop of Hope</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: donorEmail, subject, html });
};

export const sendBadgeEmail = async (
  donorEmail: string,
  donorName: string,
  badgeName: string,
  badgeDescription: string,
): Promise<boolean> => {
  const subject = `🏆 New Badge Unlocked: ${badgeName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; }
        .body { background: #fff; padding: 30px; border: 1px solid #eee; }
        .badge-box { text-align: center; padding: 30px; background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; margin: 20px 0; }
        .badge-icon { font-size: 64px; margin-bottom: 16px; display: block; }
        .badge-name { font-size: 24px; font-weight: bold; color: #b45309; margin-bottom: 8px; }
        .badge-desc { color: #92400e; font-size: 16px; }
        .btn { display: inline-block; background-color: #f59e0b; color: white !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .footer { color: #999; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏆 Achievement Unlocked!</h1>
          <p>Congratulations, ${donorName}!</p>
        </div>
        <div class="body">
          <p>Hi <strong>${donorName}</strong>,</p>
          <p>Your incredible commitment to saving lives has earned you a new achievement!</p>
          <div class="badge-box">
            <span class="badge-icon">🏅</span>
            <div class="badge-name">${badgeName}</div>
            <div class="badge-desc">${badgeDescription}</div>
          </div>
          <p>Thank you for being such an important part of our community. Your contribution makes a real difference.</p>
          <a href="${process.env.APP_URL || 'https://drop-of-hope.vercel.app'}/profile?tab=achievements" class="btn">View My Achievements</a>
          <p style="margin-top:24px">Keep up the amazing work!<br><strong>The Drop of Hope Team</strong></p>
        </div>
        <div class="footer">This is an automated email. Do not reply. &copy; Drop of Hope</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: donorEmail, subject, html });
};

export const sendNoShowEmail = async (
  donorEmail: string,
  donorName: string,
  driveName: string,
  appointmentDate: string,
  appointmentTime: string,
): Promise<boolean> => {
  const subject = `Notice: Missed Blood Donation Appointment`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6b7280; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; }
        .body { background: #fff; padding: 30px; border: 1px solid #eee; }
        .info-box { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 16px 20px; border-radius: 0 6px 6px 0; margin: 20px 0; }
        .detail-row { display: flex; gap: 12px; margin: 8px 0; font-size: 15px; }
        .label { font-weight: bold; color: #4b5563; min-width: 110px; }
        .btn { display: inline-block; background-color: #d32f2f; color: white !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .footer { color: #999; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Missed Appointment Notice</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${donorName}</strong>,</p>
          <p>We noticed you weren't able to make it to your scheduled blood donation appointment. We missed you!</p>
          <div class="info-box">
            <div class="detail-row"><span class="label">🏥 Blood Drive:</span> ${driveName}</div>
            <div class="detail-row"><span class="label">📅 Date:</span> ${appointmentDate}</div>
            <div class="detail-row"><span class="label">⏰ Time:</span> ${appointmentTime}</div>
          </div>
          <p>Your appointment has been marked as a "No-Show". Don't worry, you can easily book a new appointment at your convenience.</p>
          <p>Blood is always in high demand, and your contribution can save lives. We hope to see you soon!</p>
          <a href="${process.env.APP_URL || 'https://drop-of-hope.vercel.app'}/drives" class="btn">Find New Blood Drive</a>
          <p style="margin-top:24px">Best regards,<br><strong>The Drop of Hope Team</strong></p>
        </div>
        <div class="footer">This is an automated email. Do not reply. &copy; Drop of Hope</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: donorEmail, subject, html });
};

export const sendUrgentEmail = async (
  donorEmail: string,
  donorName: string,
  bloodType: string,
  hospitalName: string,
  unitsNeeded: number,
  location?: string,
): Promise<boolean> => {
  const subject = `🚨 URGENT: ${bloodType} Blood Needed at ${hospitalName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; }
        .body { background: #fff; padding: 30px; border: 1px solid #eee; }
        .urgent-box { background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; gap: 12px; margin: 8px 0; font-size: 16px; }
        .label { font-weight: bold; color: #b91c1c; min-width: 120px; }
        .btn { display: inline-block; background-color: #d32f2f; color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; font-size: 16px; }
        .footer { color: #999; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Urgent Blood Request</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${donorName}</strong>,</p>
          <p>We are reaching out to you because there is a critical need for your blood type in your area.</p>
          <div class="urgent-box">
            <div class="detail-row"><span class="label">Blood Type:</span> <strong>${bloodType}</strong></div>
            <div class="detail-row"><span class="label">🏥 Hospital:</span> ${hospitalName}</div>
            <div class="detail-row"><span class="label">📦 Units Needed:</span> ${unitsNeeded}</div>
            ${location ? `<div class="detail-row"><span class="label">📍 Location:</span> ${location}</div>` : ""}
          </div>
          <p>Every minute counts. If you are eligible to donate, please schedule an appointment or visit the hospital directly as soon as possible.</p>
          <a href="${process.env.APP_URL || 'https://drop-of-hope.vercel.app'}/drives" class="btn">Donate Now</a>
          <p style="margin-top:24px">Thank you for your life-saving support.<br><strong>The Drop of Hope Team</strong></p>
        </div>
        <div class="footer">This is an urgent automated alert. &copy; Drop of Hope</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: donorEmail, subject, html });
};

export const sendBroadcastEmail = async (
  donorEmail: string,
  donorName: string,
  title: string,
  message: string,
  actionUrl?: string,
): Promise<boolean> => {
  const subject = `📢 Announcement: ${title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { background: #fff; padding: 30px; border: 1px solid #eee; line-height: 1.6; }
        .btn { display: inline-block; background-color: #1f2937; color: white !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .footer { color: #999; font-size: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 Drop of Hope Announcement</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${donorName}</strong>,</p>
          <h2 style="color: #111827; margin-top: 0;">${title}</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          ${actionUrl ? `<a href="${process.env.APP_URL || 'https://drop-of-hope.vercel.app'}${actionUrl}" class="btn">Learn More</a>` : ""}
          <p style="margin-top:24px">Best regards,<br><strong>The Drop of Hope Team</strong></p>
        </div>
        <div class="footer">You are receiving this as a registered donor. &copy; Drop of Hope</div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: donorEmail, subject, html });
};
