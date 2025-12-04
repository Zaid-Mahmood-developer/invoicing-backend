// import Joi from "joi";

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const passwordRegex =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// export const userValidation = Joi.object({
//   NTNCNIC: Joi.number()
//     .required()
//     .messages({
//       "any.required": "NTN/CNIC is required",
//       "number.base": "NTN/CNIC must be a number",
//     }),

//   FBRToken: Joi.string()
//     .required()
//     .messages({
//       "any.required": "FBR Token is required",
//       "string.empty": "FBR Token cannot be empty",
//     }),

//   BusinessName: Joi.string()
//     .required()
//     .messages({
//       "any.required": "Business Name is required",
//       "string.empty": "Business Name cannot be empty",
//     }),

//   Province: Joi.string()
//     .required()
//     .messages({
//       "any.required": "Province is required",
//     }),

//   Address: Joi.string()
//     .required()
//     .messages({
//       "any.required": "Address is required",
//     }),

//   email: Joi.string()
//     .pattern(emailRegex)
//     .required()
//     .messages({
//       "any.required": "Email is required",
//       "string.pattern.base": "Please provide a valid email address",
//     }),

//   username: Joi.string()
//     .min(3)
//     .required()
//     .messages({
//       "any.required": "Username is required",
//       "string.min": "Username must be at least 3 characters",
//     }),

//   password: Joi.string()
//     .pattern(passwordRegex)
//     .required()
//     .messages({
//       "any.required": "Password is required",
//       "string.pattern.base":
//         "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character",
//     }),
//      newpassword: Joi.string()
//     .pattern(passwordRegex)
//     .required()
//     .messages({
//       "any.required": "Password is required",
//       "string.pattern.base":
//         "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character",
//     })
// });
