import mongoose from "mongoose";
import SalesInvoice from "../models/saleInvoice.model.js";
import Joi from "joi";
import { User } from "../models/user.model.js";
import { isEmailBlocked } from "../utils/paymentBlock.js";

const publicFields = "username email BusinessName role isBlocked FBRToken createdAt invoiceDate Address Province NTNCNIC";

const updateUserSchema = Joi.object({
  Address: Joi.string().trim().min(1),
  Province: Joi.string().trim().min(1),
  NTNCNIC: Joi.number().integer().min(0).max(Number.MAX_SAFE_INTEGER),
  username: Joi.string().trim().min(1),
  email: Joi.string().trim().email({ tlds: { allow: false } }),
  FBRToken: Joi.string().trim().min(1),
  role: Joi.string().valid("user", "admin"),
}).min(1).unknown(false);

export const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "A valid user ID is required" });
  }
  const { error, value } = updateUserSchema.required().validate(req.body, { convert: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  if (String(req.user._id) === id && value.role === "user") {
    return res.status(403).json({ message: "You cannot remove your own administrator role" });
  }
  try {
    if (value.email) {
      const duplicate = await User.findOne({
        _id: { $ne: id },
        email: { $regex: `^${value.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });
      if (duplicate) return res.status(409).json({ message: "Email is already used by another account" });
    }
    const user = await User.findByIdAndUpdate(
      id, { $set: value }, { new: true, runValidators: true },
    ).select(publicFields).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User updated successfully", user: { ...user, paymentBlocked: isEmailBlocked(user.email) } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Email is already used by another account" });
    if (error.name === "ValidationError") return res.status(400).json({ message: "Invalid user details" });
    return res.status(500).json({ message: "Unable to update user" });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(publicFields).sort({ createdAt: -1 }).lean();
    return res.json({ users: users.map(user => ({ ...user, paymentBlocked: isEmailBlocked(user.email) })) });
  } catch {
    return res.status(500).json({ message: "Unable to load users" });
  }
};

export const setUserBlocked = async (req, res) => {
  const { id } = req.params;
  const { isBlocked } = req.body;
  if (!mongoose.isValidObjectId(id) || typeof isBlocked !== "boolean") {
    return res.status(400).json({ message: "A valid user ID and boolean isBlocked are required" });
  }
  if (String(req.user._id) === id) {
    return res.status(403).json({ message: "You cannot change your own account status" });
  }
  try {
    // Admin accounts are protected to prevent administrator lockout.
    const user = await User.findOneAndUpdate(
      { _id: id, role: { $ne: "admin" } },
      { $set: { isBlocked, ...(isBlocked ? { refreshToken: null } : {}) } },
      { new: true, runValidators: true },
    ).select(publicFields).lean();
    if (!user) return res.status(404).json({ message: "User not found or account is a protected administrator" });
    return res.json({ message: isBlocked ? "Account blocked" : "Account unblocked", user: { ...user, paymentBlocked: isEmailBlocked(user.email) } });
  } catch {
    return res.status(500).json({ message: "Unable to update account status" });
  }
};

const invoiceFields = "invoiceDate dcNo invoiceNo sellerAddress sellerProvince sellerNTNCNIC buyerBusinessName grandTotal createdAt";
const invoiceUpdateSchema = Joi.object({
  invoiceDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).custom((value, helpers) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
      ? helpers.error("any.invalid") : value;
  }),
  sellerAddress: Joi.string().trim().min(1),
  sellerProvince: Joi.string().trim().min(1),
  sellerNTNCNIC: Joi.string().trim().min(1),
  dcNo: Joi.string().trim().allow(""),
  invoiceNo: Joi.string().trim().allow(""),
}).min(1).unknown(false);

export const listUserInvoices = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "A valid user ID is required" });
  try {
    if (!await User.exists({ _id: id })) return res.status(404).json({ message: "User not found" });
    const invoices = await SalesInvoice.find({ userId: id }).select(invoiceFields).sort({ createdAt: -1 }).lean();
    return res.json({ invoices });
  } catch {
    return res.status(500).json({ message: "Unable to load invoices" });
  }
};

export const updateUserInvoice = async (req, res) => {
  const { id, invoiceId } = req.params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(invoiceId)) {
    return res.status(400).json({ message: "Valid user and invoice IDs are required" });
  }
  const { error, value } = invoiceUpdateSchema.required().validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const invoice = await SalesInvoice.findOneAndUpdate(
      { _id: invoiceId, userId: id }, { $set: value }, { new: true, runValidators: true },
    ).select(invoiceFields).lean();
    if (!invoice) return res.status(404).json({ message: "Invoice not found for this user" });
    return res.json({ message: "Invoice updated successfully", invoice });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ message: "Invalid invoice details" });
    return res.status(500).json({ message: "Unable to update invoice" });
  }
};
