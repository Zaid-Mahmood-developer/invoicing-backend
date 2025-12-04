import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    NTNCNIC: {
      type: Number,
      required: true,
      // unique: true,
    },

    FBRToken: {
      type: String,
      required: true,
      // default: null,
    },

    BusinessName: {
      type: String,
      required: true,
    },

    Province: {
      type: String,
      required: true,
    
    },

    Address: {
      type: String,
      required: true,
    },

     email: {
      type: String,
      required: true,
      unique: true,
    },

    username: {
      type: String,
      required: true,
      // unique: true
     
    },

    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,
resetPasswordTokenExpireAt: {type: Date,
    index: { expires: 3600 }},
refreshToken: { type: String },
role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
