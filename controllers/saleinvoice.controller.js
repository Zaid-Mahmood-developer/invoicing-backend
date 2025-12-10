import SalesInvoice from "../models/saleInvoice.model.js";
import {User} from "../models/user.model.js"
import moment from "moment";

export const createInvoice = async (req, res) => {
  try {
     req.body.userId = req.user._id;
    const invoice = await SalesInvoice.create(req.body);

    return res.status(201).json({
      status: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};


export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await SalesInvoice.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Get All Error:", error);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findById(req.params.id);

    if (!invoice)
      return res.status(404).json({ status: false, message: "Invoice not found" });

    return res.status(200).json({
      status: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Get By ID Error:", error);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

export const getSellerDetails = async (req, res) => {
  try {
    // Logged-in user ka id middleware se milta hai
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "NTNCNIC BusinessName Address Province FBRToken"
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Seller details fetched successfully",
      data: user, // 👍 single object, array nahi!
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error fetching seller details",
      error: error.message,
    });
  }
};



export const getTodaySales = async (req, res) => {
  try {
    // Get today's date in (DD-MM-YYYY)
    const today = moment().format("DD-MM-YYYY");

    // Fetch today's invoices
    const invoices = await SalesInvoice.find({
      invoiceDate: today,
    }).populate("userId", "name"); // To get created by name

    if (!invoices.length) {
      return res.status(200).json({
        status: true,
        message: "No sales found for today",
        data: [],
        totalAmount: 0,
        totalTax: 0
      });
    }

    // Calculate totals
    let totalAmount = 0;
    let totalTax = 0;

    const list = invoices.map((inv) => {
      let amount = inv.grandTotal || 0;

      // Calculate tax by summing item taxes
      let tax = inv.items.reduce(
        (sum, item) => sum + (item.salesTaxApplicable || 0),
        0
      );

      totalAmount += amount;
      totalTax += tax;

      return {
        date: inv.invoiceDate,
        invoiceNo: inv.invoiceRefNo || "N/A",
        customer: inv.buyerBusinessName,
        amount,
        tax,
        createdBy: inv.userId?.name || "Unknown",
      };
    });

    return res.status(200).json({
      status: true,
      message: "Today's sales fetched successfully",
      data: list,
      totalAmount,
      totalTax,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error while fetching today's sales"
    });
  }
};