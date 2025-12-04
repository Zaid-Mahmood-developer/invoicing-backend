import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Mailtrap SMTP configuration
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Mailtrap connection failed:", error);
  } else {
    console.log("✅ Mailtrap connected successfully!");
  }
});
