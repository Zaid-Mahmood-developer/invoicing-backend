import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.Routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());

// for development purposes only
// app.use(cors({
//   origin: true,
//   credentials: true
// }));

// for production
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

app.use(express.json());

// Root route (for testing)
app.get("/", (req, res) => {
  res.send("🚀 Backend server is running successfully!");
});

// API routes
app.use("/api/users", userRoutes);

// Database connection
let isConnected = false;
const initDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

initDB();

export default app;

// Dev mode app js code

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import connectDB from "./config/db.js";
// import userRoutes from "./routes/user.Routes.js";

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cookieParser());

// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true
// }))

// app.use(express.json());

// // Root route
// app.get("/", (req, res) => {
//   res.send("🚀 Backend server is running successfully!");
// });

// // API routes
// app.use("/api/users", userRoutes);

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();

//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Server startup failed:", error);
//     process.exit(1);
//   }
// };

// startServer();

// export default app;