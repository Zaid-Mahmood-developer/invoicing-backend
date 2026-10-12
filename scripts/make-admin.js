import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { User } from "../models/user.model.js";

const email = (process.argv[2] || process.env.ADMIN_EMAIL || "").trim();
if (!email || !process.env.MONGO_URI) {
  console.error("Usage: npm run make-admin -- existing-account@example.com (or set ADMIN_EMAIL in .env; requires MONGO_URI)");
  process.exitCode = 1;
} else {
  try {
    await connectDB();
    const user = await User.findOneAndUpdate({ email }, { $set: { role: "admin" } }, { new: true });
    if (!user) throw new Error("No account found with that exact email. Register the account first.");
    console.log("Administrator access granted. Sign in again to manage users.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
