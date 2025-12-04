// import mongoose from "mongoose";

// const customerSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Customer name is required"],
//       unique: true
//       // match: [/^[A-Za-z ]*$/, "Only alphabets and spaces allowed"],
//       // maxLength: [30, "Maximum 30 characters allowed"],
//       // trim: true,
//     },

//     ntnCnic: {
//       type: String,
//       required: [true, "NTN or CNIC is required"],
//       unique: true, // optional, depends on business logic
//       // validate: {
//       //   validator: function (value) {
//       //     const ntnPattern = /^[0-9]{7}-[0-9]{1}$/;
//       //     const cnicPattern = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
//       //     return ntnPattern.test(value) || cnicPattern.test(value);
//       //   },
//       //   message: "Must be a valid NTN (#######-#) or CNIC (#####-#######-#)",
//       // },
//     },

//     address: {
//       type: String,
//       required: [true, "Address is required"],
//       // match: [/^[A-Za-z0-9\s,.\-\/()]+$/, "Invalid characters in address"],
//       // trim: true,
//     },

//     contact: {
//       type: String,
//       required: [true, "Contact number is required"],
//     //   match: [/^\+92-[0-9]{3}-[0-9]{7}$/, "Format must be +92-XXX-XXXXXXX"],
//     //   unique: true, // optional — if every contact should be unique
//     },

//     // product: {
//     //   type: String,
//     //   required: [true, "Product is required"],
//     //   // validate: {
//     //   //   validator: (v) => v && v !== "Select preferred product",
//     //   //   message: "Please select a valid product",
//     //   // },
//     // },

//     province: {
//       type: String,
//       required: [true, "Province is required"],
     
//     },

//     customertype: {
//       type: String,
//       required: [true, "Customer type is required"],
//       // enum: ["Registered", "Un-Registered"],
//     },
//      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Customer", customerSchema);



import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      // match: [/^[A-Za-z ]*$/, "Only alphabets and spaces allowed"],
      // maxLength: [30, "Maximum 30 characters allowed"],
      // trim: true,
    },

    ntnCnic: {
      type: String,
      required: [true, "NTN or CNIC is required"],
      // validate: {
      //   validator: function (value) {
      //     const ntnPattern = /^[0-9]{7}-[0-9]{1}$/;
      //     const cnicPattern = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
      //     return ntnPattern.test(value) || cnicPattern.test(value);
      //   },
      //   message: "Must be a valid NTN (#######-#) or CNIC (#####-#######-#)",
      // },
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      // match: [/^[A-Za-z0-9\s,.\-\/()]+$/, "Invalid characters in address"],
      // trim: true,
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
    //   match: [/^\+92-[0-9]{3}-[0-9]{7}$/, "Format must be +92-XXX-XXXXXXX"],
    //   unique: true, // optional — if every contact should be unique
    },

    // product: {
    //   type: String,
    //   required: [true, "Product is required"],
    //   // validate: {
    //   //   validator: (v) => v && v !== "Select preferred product",
    //   //   message: "Please select a valid product",
    //   // },
    // },

    province: {
      type: String,
      required: [true, "Province is required"],
     
    },

    customertype: {
      type: String,
      required: [true, "Customer type is required"],
      // enum: ["Registered", "Un-Registered"],
    },
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true},
  },
  { timestamps: true }
);
customerSchema.index({ name: 1, userId: 1 }, { unique: true });

customerSchema.index({ ntnCnic: 1, userId: 1 }, { unique: true });
export default mongoose.model("Customer", customerSchema);