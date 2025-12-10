import {User} from "../models/user.model.js";

export const getUserByConditions = async (condition, removeFields = "") => {
  return await User.findOne({ ...condition }).select(removeFields);
};
