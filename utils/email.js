import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_APP_PASS,
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
