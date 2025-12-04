import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(`${process.env.MONGO_URI}/devoxDB`);
//     console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
//   } catch (err) {
//     console.log("❌ MongoDB Connection Failed:", err.message);
//     process.exit(1); 
//   }
// };
async function connectDB(isConnected) {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/devoxDB`);
    isConnected = true;
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.log("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}


export default connectDB;
