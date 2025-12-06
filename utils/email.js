import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
// ===== DEBUG: Check if env variables are loaded =====
console.log("MAILTRAP_USER =", process.env.MAILTRAP_USER);
console.log("MAILTRAP_PASS =", process.env.MAILTRAP_PASS ? "Loaded" : "Missing");

export const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Mailtrap SMTP failed:", error);
  } else {
    console.log("✅ Mailtrap SMTP connected successfully!");
  }
});
