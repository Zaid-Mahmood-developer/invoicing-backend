import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from "./routes/user.Routes.js"

const app = express();
app.use(cookieParser())

dotenv.config();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: true,
  credentials: true
}));


app.use(express.json());


app.use("/api/users", userRoutes);

let isConnected = false;
app.use((err, req, res, next) => {
  if(!isConnected) {
    connectDB(isConnected);
  }
  next();
})

// app.listen(PORT, () => {
//   connectDB();
//   console.log("Server is Connected successfully");
// });
export default app;