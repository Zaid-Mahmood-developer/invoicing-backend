import dotenv from "dotenv";
dotenv.config();

export const config = {
  secrets: {
    // JWT_SECRET: process.env.JWT_SECRET_USER,  
    // jwtTokenExp: process.env.JWT_TOKEN_EXPIRE,
    // jwtRefreshExp: process.env.JWT_REFRESH_EXPIRE,
     jwtSecretKeyAdmin: process.env.JWT_SECRET_ADMIN,
        jwtSecretKeyUser: process.env.JWT_SECRET_USER,
        jwtSecretKey: process.env.JWT_SECRET,

        jwtTokenExp: process.env.JWT_TOKEN_EXPIRE,
        jwtRefreshExp: process.env.JWT_REFRESH_EXPIRE,
        jwtForgotExp: process.env.JWT_FORGOT_EXPIRE,
  },
};
