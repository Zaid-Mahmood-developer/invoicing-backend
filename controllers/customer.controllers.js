// import customerModel from "../models/customer.Model.js";

// // ✅ CREATE Customer
// // export const addCustomer = async (req, res) => {
// //   try {
// //     const { name, ntnCnic, address, contact, province, customertype } =
// //       req.body;

// //     if (
// //       !name ||
// //       !ntnCnic ||
// //       !address ||
// //       !contact ||
// //       // !product ||
// //       !province ||
// //       !customertype
// //     ) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     const customer = await customerModel.create(req.body);

// //     res.status(201).json({
// //       success: true,
// //       message: "Customer registered successfully",
// //       data: customer,
// //     });
// //   } catch (error) {
// //     console.error("Error adding customer:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message,
// //     });
// //   }
// // };

// export const addCustomer = async (req, res) => {
//   try {
//     const { name, ntnCnic, address, contact, province, customertype } = req.body;

//     if (!name || !ntnCnic || !address || !contact || !province || !customertype) {
//       return res.status(400).json({
//         status: false,
//         message: "All fields are required",
//       });
//     }

//     const existing = await Customer.findOne({ ntnCnic });
//     if (existing) {
//       return res.status(400).json({
//         status: false,
//         message: "Customer with this NTN/CNIC already exists",
//       });
//     }

//     const customer = await Customer.create({
//       name,
//       ntnCnic,
//       address,
//       contact,
//       province,
//       customertype,
//       userId: req.user?._id
//     });

//     res.status(201).json({
//       status: true,
//       message: "Customer created successfully",
//       customer,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// // ✅ GET ALL Customers
// export const getAllCustomers = async (req, res) => {
//   try {
//     const customers = await customerModel.find().sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       data: customers,
//     });
//   } catch (error) {
//     console.error("Get all customers error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ GET Customer By ID
// export const getCustomerById = async (req, res) => {
//   try {
//     const customer = await customerModel.findById(req.params.id);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: customer,
//     });
//   } catch (error) {
//     console.error("Get customer error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ UPDATE Customer
// export const updateCustomer = async (req, res) => {
//   try {
//     const updatedCustomer = await customerModel.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updatedCustomer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Customer updated successfully",
//       data: updatedCustomer,
//     });
//   } catch (error) {
//     console.error("Update customer error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ DELETE Customer
// export const deleteCustomer = async (req, res) => {
//   try {
//     const deletedCustomer = await customerModel.findByIdAndDelete(req.params.id);

//     if (!deletedCustomer) {
//       return res.status(404).json({
//         success: false,
//         message: "Customer not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Customer deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete customer error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };



import customerModel from "../models/customer.Model.js";

// ✅ CREATE Customer
export const addCustomer = async (req, res) => {
  try {
    const { name, ntnCnic, address, contact, province, customertype } =
      req.body;
 const userId = req.user.id; 
    if (
      !name ||
      !ntnCnic ||
      !address ||
      !contact ||
      // !product ||
      !province ||
      !customertype
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingCustomer = await customerModel.findOne({
      userId,
      $or: [{ name }, { ntnCnic }],
    });
    if (existingCustomer) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Customer with this name or Ntn/Cnic already exists"
        });
    }

    const customer = await customerModel.create({ ...req.body, userId });

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET ALL Customers
export const getAllCustomers = async (req, res) => {
  try {
  const userId = req.user.id;
    const customers = await customerModel.find({userId}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Get all customers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET Customer By ID
export const getCustomerById = async (req, res) => {
  try {
        const userId = req.user.id;
    const customer = await customerModel.findById({ _id: req.params.id, userId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ UPDATE Customer
export const updateCustomer = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedCustomer = await customerModel.findByIdAndUpdate(
     { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ DELETE Customer
export const deleteCustomer = async (req, res) => {
  try {
      const userId = req.user.id;
    const deletedCustomer = await customerModel.findByIdAndDelete({ _id: req.params.id, userId });

    if (!deletedCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};