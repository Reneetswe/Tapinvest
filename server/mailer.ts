import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || user;

if (!host || !port || !user || !pass || !from) {
  // Avoid throwing at module import; we'll throw when actually attempting to send.
}

export function getTransport() {
  if (!host || !port || !user || !pass) {
    throw new Error("SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.");
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  });
}

export async function sendMail(to: string, subject: string, html: string, text?: string) {
  const transporter = getTransport();
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
