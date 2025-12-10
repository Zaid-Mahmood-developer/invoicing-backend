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
   
refreshToken: { type: String },
role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

const resetPasswordTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    resetPasswordToken: {
      type: String,   
      required: true,
    },
    resetPasswordExpires: {  
      type: Date,
      index: { expires: 0 }
    }
  },
  { timestamps: true }
);

export const ResetPassword = mongoose.model("ResetPassword", resetPasswordTokenSchema);