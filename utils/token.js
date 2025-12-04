import jwt from "jsonwebtoken";
import { config } from "../config/app2.js";

  async function generateToken(payload, role) {


    const secretKey = role === 'admin' ? config.secrets.jwtSecretKeyAdmin : config.secrets.jwtSecretKeyUser;
    const token = jwt.sign(payload, secretKey, { expiresIn: config.secrets.jwtTokenExp });
    return token;
  }
  
  async function generateRefreshToken(payload, role) {
    console.log(config.secrets.jwtSecretKey,"test")

    const secretKey = role === 'admin' ? config.secrets.jwtSecretKeyAdmin : config.secrets.jwtSecretKeyUser;
    const token = jwt.sign(payload, secretKey, { expiresIn: config.secrets.jwtRefreshExp });
    return token;
  }

  async function verifyJwtToken(token, role) {
    const secretKey = role === 'admin' ? config.secrets.jwtSecretKeyAdmin : config.secrets.jwtSecretKeyUser;
    return jwt.verify(token, secretKey);
  }

export { generateToken, generateRefreshToken , verifyJwtToken};
