import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from 'crypto'
import jwt from "jsonwebtoken"
import { sendPasswordResetEmail } from "../utils/nodemailer.js";
import { getUserByConditions } from "../service/user.service.js";
import { generateRefreshToken, generateToken } from "../utils/token.js";
import moment from "moment";

export const Signup = async (req, res) => {
  try {
    const {
      NTNCNIC,
      FBRToken,
      BusinessName,
      Province,
      Address,
      email,
      username,
      password,
      newpassword,
    } = req.body;

    if (
      !NTNCNIC ||
      !FBRToken ||
      !BusinessName ||
      !Province ||
      !Address ||
      !email ||
      !username ||
      !password ||
      !newpassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== newpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await userModel.findOne({
      $or: [{ email }, { NTNCNIC }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already exists" });
      }
      if (existingUser.NTNCNIC == NTNCNIC) {
        return res.status(409).json({ message: "NTN/CNIC already exists" });
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      NTNCNIC,
      FBRToken,
      BusinessName,
      Province,
      Address,
      email,
      username,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        NTNCNIC: user.NTNCNIC,
        FBRToken: user.FBRToken,
        BusinessName: user.BusinessName,
        Province: user.Province,
        Address: user.Address,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({
        message: "Please provide Email, Username, and Password",
      });
    }
    const user = await getUserByConditions({ email, username });

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or username — user not found",
      });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    const token = await generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,

    });

    const refreshToken = await generateRefreshToken({
      id: user._id,
      email: user.email,
      role: user.role,

    });

    user.refreshToken = refreshToken;
    await user.save();
    return res.status(200)
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: true ,
        sameSite : 'none',
        maxAge: 7200000
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true ,
        sameSite : 'none',
        maxAge: 7200000
      })
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,

        },
      });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const user = await userModel.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.JWT_SECRET_USER, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET_USER,
        { expiresIn: process.env.JWT_TOKEN_EXPIRE }
      );

      // Send access token AND user info
      return res.status(200).json({
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        }
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(403).json({ status: false, message: "User not found" }); 
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpireAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    return res.status(201).json({status:true, message: "Password reset link sent to your email" }); // ✅ fixed
  } catch (error) {
    console.error(error);
    return res.status(500).json({status:false, message: "Internal server error" });
  }
};



export const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newpassword } = req.body;

    // ✅ Find user where token matches and expiry is still valid
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpireAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpireAt = undefined;

    await user.save();

    return res
      .status(200)
      .json({ status: true, message: "Password reset successful" });

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Server error during password reset" });
  }
};



export const changepassword=async(req,res)=>{
  try {
    const {oldpassword, newpassword}=req.body
    const userId=req.user.id
    const user=await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
     const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newpassword, 10);
    await user.save();

    return res.status(200).json({ status: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error while changing password" });
  }
};
 

export const logout = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    user.refreshToken = null;
    await user.save();


    return res.status(200)
      .clearCookie("accessToken", { httpOnly: true, secure: true , sameSite : 'none'})
      .clearCookie("refreshToken", { httpOnly: true, secure: true , sameSite : 'none'})
      .json({
        status: true,
        message: "Logout successful",
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      status: false,
      message: "Error during logout"
    });
  }
};








// import userModel from "../models/user.model.js";
// import bcrypt from "bcrypt";
// import crypto from 'crypto'
// import jwt from "jsonwebtoken"
// import { sendPasswordResetEmail } from "../utils/nodemailer.js";
// import { getUserByConditions } from "../service/user.service.js";
// // import { userValidation } from "../validations/user.validation.js";
// import { generateRefreshToken, generateToken } from "../utils/token.js";


// // export const Signup = async (req, res) => {
// //   try {
// //     // const { error } = userValidation.validate(req.body);
// //     // if (error) {
// //     //   return res.status(400).json({ message: error.details[0].message });
// //     // }

// //     const {
// //       NTNCNIC,
// //       FBRToken,
// //       BusinessName,
// //       Province,
// //       Address,
// //       email,
// //       username,
// //       password,
// //       newpassword,
// //     } = req.body;

// //     if (
// //       !NTNCNIC ||
// //       !FBRToken ||
// //       !BusinessName ||
// //       !Province ||
// //       !Address ||
// //       !email ||
// //       !username ||
// //       !password ||
// //       !newpassword
// //     ) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     if (password !== newpassword) {
// //       return res.status(400).json({ message: "Passwords do not match" });
// //     }

// //     const existingUser = await userModel.findOne({
// //       $or: [{ email }, { username }],
// //     });

// //     if (existingUser) {
// //       return res.status(409).json({ message: "User already exists" });
// //     }

// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     const user = await userModel.create({
// //       NTNCNIC,
// //       FBRToken,
// //       BusinessName,
// //       Province,
// //       Address,
// //       email,
// //       username,
// //       password: hashedPassword,
// //     });

// //     return res.status(201).json({
// //       message: "User registered successfully",
// //       user: {
// //         _id: user._id,
// //         NTNCNIC: user.NTNCNIC,
// //         FBRToken: user.FBRToken,
// //         BusinessName: user.BusinessName,
// //         Province: user.Province,
// //         Address: user.Address,
// //         email: user.email,
// //         username: user.username,
// //       },
// //     });
// //   } catch (error) {
// //     return res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// export const Signup = async (req, res) => {
//   try {
//     // const { error } = userValidation.validate(req.body);
//     // if (error) {
//     //   return res.status(400).json({ message: error.details[0].message });
//     // }

//     const {
//       NTNCNIC,
//       FBRToken,
//       BusinessName,
//       Province,
//       Address,
//       email,
//       username,
//       password,
//       newpassword,
//     } = req.body;

//     if (
//       !NTNCNIC ||
//       !FBRToken ||
//       !BusinessName ||
//       !Province ||
//       !Address ||
//       !email ||
//       !username ||
//       !password ||
//       !newpassword
//     ) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (password !== newpassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     const existingUser = await userModel.findOne({
//       $or: [{ email }, { NTNCNIC }],
//     });

//     if (existingUser) {
//       if (existingUser.email === email) {
//         return res.status(409).json({ message: "Email already exists" });
//       }
//       if (existingUser.NTNCNIC == NTNCNIC) {
//         return res.status(409).json({ message: "NTN/CNIC already exists" });
//       }
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await userModel.create({
//       NTNCNIC,
//       FBRToken,
//       BusinessName,
//       Province,
//       Address,
//       email,
//       username,
//       password: hashedPassword,
//     });

//     return res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         _id: user._id,
//         NTNCNIC: user.NTNCNIC,
//         FBRToken: user.FBRToken,
//         BusinessName: user.BusinessName,
//         Province: user.Province,
//         Address: user.Address,
//         email: user.email,
//         username: user.username,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// // export const login = async (req, res) => {
// //   try {
// //     const { email, username, password } = req.body;
// //     if (!email || !username || !password) {
// //       return res.status(400).json({
// //         message: "Please provide Email, Username, and Password",
// //       });
// //     }
// //     const user = await getUserByConditions({ email, username });

// //     if (!user) {
// //       return res.status(404).json({
// //         message: "Invalid email or username — user not found",
// //       });
// //     }
// //     const validPassword = await bcrypt.compare(password, user.password);
// //     if (!validPassword) {
// //       return res.status(401).json({ message: "Incorrect password" });
// //     }
// //     const token = await generateToken({
// //       id: user._id,
// //       email: user.email,
// //       username: user.username,
// //       role: user.role, 

// //     });

// //     const refreshToken = await generateRefreshToken({
// //       id: user._id,
// //       email: user.email,
// //       role: user.role, 

// //     });
// //     user.refreshToken = refreshToken;
// //     await user.save();
// //     return res.status(200).json({
// //       message: "Login successful",
// //       token,
// //       refreshToken,
// //       user: {
// //         id: user._id,
// //         username: user.username,
// //         email: user.email,
// //         role: user.role,

// //       },
// //     });

// //   } catch (error) {
// //     console.error(error);
// //     return res.status(500).json({
// //       message: "Server error",
// //       error: error.message,
// //     });
// //   }
// // };




// export const login = async (req, res) => {
//   try {
//     const { email, username, password } = req.body;
//     if (!email || !username || !password) {
//       return res.status(400).json({
//         message: "Please provide Email, Username, and Password",
//       });
//     }
//     const user = await getUserByConditions({ email, username });

//     if (!user) {
//       return res.status(404).json({
//         message: "Invalid email or username — user not found",
//       });
//     }
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ message: "Incorrect password" });
//     }
//     const token = await generateToken({
//       id: user._id,
//       email: user.email,
//       username: user.username,
//       role: user.role,

//     });

//     const refreshToken = await generateRefreshToken({
//       id: user._id,
//       email: user.email,
//       role: user.role,

//     });

//     user.refreshToken = refreshToken;
//     await user.save();
//     return res.status(200)
//       .cookie("accessToken", token, {
//         httpOnly: true,
//         secure: true
//       })
//       .cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: true
//       })
//       .json({
//         message: "Login successful",
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           role: user.role,

//         },
//       });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };



// export const refreshTokenController = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

//     const user = await userModel.findOne({ refreshToken });
//     if (!user) return res.status(403).json({ message: "Invalid refresh token" });

//     jwt.verify(refreshToken, process.env.JWT_SECRET_USER, (err, decoded) => {
//       if (err) return res.status(403).json({ message: "Invalid token" });

//       const accessToken = jwt.sign(
//         { id: user._id, email: user.email },
//         process.env.JWT_SECRET_USER,
//         { expiresIn: process.env.JWT_TOKEN_EXPIRE }
//       );

//       // Send access token AND user info
//       return res.status(200).json({
//         accessToken,
//         user: {
//           id: user._id,
//           email: user.email,
//           username: user.username,
//         }
//       });
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };






// export const forgotpassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.status(403).json({ status: false, message: "User not found" }); 
//     }

//     const resetToken = crypto.randomBytes(20).toString("hex");
//     const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; 

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordTokenExpireAt = resetTokenExpiresAt;

//     await user.save();

//     await sendPasswordResetEmail(email, resetToken);

//     return res.status(201).json({status:true, message: "Password reset link sent to your email" }); // ✅ fixed
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({status:false, message: "Internal server error" });
//   }
// };



// export const resetpassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newpassword } = req.body;

//     // ✅ Find user where token matches and expiry is still valid
//     const user = await userModel.findOne({
//       resetPasswordToken: token,
//       resetPasswordTokenExpireAt: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired reset token" });
//     }

//     // ✅ Hash new password
//     const hashedPassword = await bcrypt.hash(newpassword, 10);

//     user.password = hashedPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordTokenExpireAt = undefined;

//     await user.save();

//     return res
//       .status(200)
//       .json({ status: true, message: "Password reset successful" });

//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ status: false, message: "Server error during password reset" });
//   }
// };



// export const changepassword=async(req,res)=>{
//   try {
//     const {oldpassword, newpassword}=req.body
//     const userId=req.user.id
//     const user=await userModel.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//      const isMatch = await bcrypt.compare(oldpassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     user.password = await bcrypt.hash(newpassword, 10);
//     await user.save();

//     return res.status(200).json({ status: true, message: "Password changed successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ status: false, message: "Server error while changing password" });
//   }
// };
 





// // export const logout = async (req, res) => {
// //   try {
// //     const userId = req.user.id; 

// //     const user = await userModel.findById(userId);
// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

    
// //     user.refreshToken = null;
// //     await user.save();

    
// //     return res.status(200).json({
// //       message: "Logout successful — please clear your tokens on client side",
// //     });
// //   } catch (error) {
// //     console.error("Logout error:", error);
// //     return res.status(500).json({ message: "Server error during logout" });
// //   }
// // };

// export const logout = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }


//     user.refreshToken = null;
//     await user.save();


//     return res.status(200)
//       .clearCookie("accessToken", { httpOnly: true, secure: true })
//       .clearCookie("refreshToken", { httpOnly: true, secure: true })
//       .json({
//         status: true,
//         message: "Logout successful",
//       });
//   } catch (error) {
//     console.error("Logout error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Error during logout"
//     });
//   }
// };