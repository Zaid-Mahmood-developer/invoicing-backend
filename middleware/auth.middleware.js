
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import UserModel from '../models/user.model.js';

// dotenv.config();

// export const isAuthorized = async (req, res, next) => {
//   try {
//     const accessCookies = req.cookies.accessToken;
//     if (!accessCookies) {
//       return res.status(401).json({
//         status: false,
//         message: "Access Cookies are missing"
//       })
//     }
//     const decodeToken = jwt.verify(accessCookies, process.env.JWT_SECRET_USER);
//     if (!decodeToken) {
//       return res.status(404).json({
//         status: false,
//         message: "Can't decode the access token"
//       })
//     }
//     console.log(decodeToken , "decodeToken")
//     const user = await UserModel.findById(decodeToken?.id);
//     if (!user) {
//       return res.status(404).json({
//         status: false,
//         message: "User doesnot found with the provided token id"
//       })
//     }
//     req.user = user;
//     next();
//   }
//   catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "Error found in verifying Jwt Token"
//     })
//   }
// };




import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/user.model.js";

dotenv.config();

export const isAuthorized = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Access token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    if (!decoded?.id) {
      return res.status(401).json({
        status: false,
        message: "Invalid token",
      });
    }

    // Fetch user from DB
    const user = await UserModel.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({
      status: false,
      message: "Unauthorized: invalid or expired token... Pleaase login again.",
      error: error.message,
    });
  }
};