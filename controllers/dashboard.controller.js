// import SalesInvoice from "../models/saleInvoice.model.js";





// // import Customer from "../models/customer.Model.js";

// // export const  getDashboardStats = async (req, res) => {
// //   try {
// //     const userId = req.userId;

// //     const totalInvoices = await SalesInvoice.countDocuments({ userId });

// //     const totalSales = await SalesInvoice.aggregate([
// //       { $match: { userId } },
// //       { $group: { _id: null, total: { $sum: "$grandTotal" } } }
// //     ]);

// //     const recentInvoices = await SalesInvoice.find({ userId })
// //       .sort({ createdAt: -1 })
// //       .limit(10);

// //     const customers = await Customer.countDocuments({ userId });

// //     res.status(200).json({
// //       status: true,
// //       data: {
// //         totalInvoices,
// //         totalSales: totalSales[0]?.total || 0,
// //         recentInvoices,
// //         customers,
// //       },
// //     });

// //   } catch (error) {
// //     res.status(500).json({ status: false, message: "Dashboard error" });
// //   }
// // };



















// export const getDashboardStats = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

  
//     const totalInvoices = await SalesInvoice.countDocuments();

  
//     const totalSales = await SalesInvoice.aggregate([
//       { $group: { _id: null, total: { $sum: "$grandTotal" } } }
//     ]);

   
//     const todayInvoices = await SalesInvoice.countDocuments({
//       createdAt: { $gte: today }
//     });

//     const todaySales = await SalesInvoice.aggregate([
//       { $match: { createdAt: { $gte: today } } },
//       { $group: { _id: null, total: { $sum: "$grandTotal" } } }
//     ]);

   
//     const last7Days = await SalesInvoice.aggregate([
//       {
//         $group: {
//           _id: {
//             day: { $dayOfMonth: "$createdAt" },
//             month: { $month: "$createdAt" },
//             year: { $year: "$createdAt" }
//           },
//           totalSales: { $sum: "$grandTotal" },
//           invoiceCount: { $sum: 1 }
//         }
//       },
//       { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
//       { $limit: 7 }
//     ]);

    
//     const latestInvoices = await SalesInvoice.find()
//       .sort({ createdAt: -1 })
//       .limit(20)
//       .lean(); 

//     return res.status(200).json({
//       success: true,
//       summary: {
//         totalInvoices,
//         totalSales: totalSales[0]?.total || 0,

//         todayInvoices,
//         todaySales: todaySales[0]?.total || 0,
//       },

//       chart: {
//         last7Days,
//       },

//       invoices: latestInvoices, 
//     });

//   } catch (error) {
//     console.error("Dashboard Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load dashboard",
//       error: error.message
//     });
//   }
// };



import SalesInvoice from "../models/saleInvoice.model.js";
import Customer from "../models/customer.Model.js";
import moment from "moment";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;


    const totalInvoices = await SalesInvoice.countDocuments({ userId });

    const totalSales = await SalesInvoice.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    const recentInvoices = await SalesInvoice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const customers = await Customer.countDocuments({ userId });

    const startOfToday = moment().startOf("day").toDate();
    const endOfToday = moment().endOf("day").toDate();

    const todayInvoices = await SalesInvoice.find({
      userId,
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    let todaySalesAmount = 0;
    let todayTax = 0;

    todayInvoices.forEach(inv => {
      todaySalesAmount += inv.grandTotal || 0;
      todayTax += inv.items.reduce(
        (sum, item) => sum + (item.salesTaxApplicable || 0),
        0
      );
    });


    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const monthlyInvoices = await SalesInvoice.find({
      userId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    let monthlySalesAmount = 0;
    let monthlyTax = 0;

    monthlyInvoices.forEach(inv => {
      monthlySalesAmount += inv.grandTotal || 0;
      monthlyTax += inv.items.reduce(
        (sum, item) => sum + (item.salesTaxApplicable || 0),
        0
      );
    });

    res.status(200).json({
      status: true,
      data: {
        totalInvoices,
        totalSales: totalSales[0]?.total || 0,
        recentInvoices,
        customers,

        todaySales: {
          date: moment().format("DD-MM-YYYY"),
          invoiceCount: todayInvoices.length,
          totalAmount: todaySalesAmount,
          totalTax: todayTax,
        },

        monthlySales: {
          month: moment().format("MMMM"),
          invoiceCount: monthlyInvoices.length,
          totalAmount: monthlySalesAmount,
          totalTax: monthlyTax,
        }
      },
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ status: false, message: "Dashboard error" });
  }
};



export const getInvoice = async (req, res) => {
  try {
    const invoice = await SalesInvoice.findById(req.params.id)
      .populate("userId");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error("Get Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
