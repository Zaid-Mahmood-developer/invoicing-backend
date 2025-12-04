import userModel from "../models/user.model.js";

export const getUserByConditions = async (condition, removeFields = "") => {
  return await userModel.findOne({ ...condition }).select(removeFields);
};
