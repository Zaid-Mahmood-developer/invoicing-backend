import productModel from "../models/product.model.js";


export const addProduct = async (req, res) => {
  try {
    const { hsCode, description, uom, taxType, qtyInHand } = req.body;
    const userId = req.user._id;
    const existingProduct = await productModel.findOne({ hsCode , userId });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "HS Code already exists",
      });
    }

    const product = await productModel.create({
      hsCode,
      description,
      uom,
      taxType,
      qtyInHand,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const updates = req.body; 
const userId = req.user.id;
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
  { _id: productId, userId },
      updates,
      { new: true, runValidators: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




export const deleteProduct = async (req, res) => {
  const { productId } = req.params;
const userId = req.user.id;
  try {
    const deletedProduct = await productModel.findByIdAndDelete({ _id: productId, userId });

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getProduct = async (req, res) => {
  const { productId } = req.params;
const userId = req.user.id;
  try {
    const product = await productModel.findById({ _id: productId, userId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getAllProducts = async (req, res) => {
  const userId = req.user.id;
  try {
    const products = await productModel.find({ userId });
    console.log(products , "products")
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const addProduct = async (req, res) => {
//   try {
//     const { hsCode, description, uom, taxType, qtyInHand } = req.body;

//     // ✅ First check if hsCode already exists
//     const existingProduct = await productModel.findOne({ hsCode });
//     if (existingProduct) {
//       return res.status(400).json({
//         success: false,
//         message: "HS Code already exists",
//       });
//     }

//     // ✅ If not exist → create new product
//     const product = await productModel.create({
//       hsCode,
//       description,
//       uom,
//       taxType,
//       qtyInHand,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Product added successfully",
//       data: product,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



// export const updateProduct = async (req, res) => {
//   const { productId } = req.params;
//   const updates = req.body; 

//   try {
//     const updatedProduct = await productModel.findByIdAndUpdate(
//       productId,
//       updates,
//       { new: true, runValidators: true } 
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };




// export const deleteProduct = async (req, res) => {
//   const { productId } = req.params;

//   try {
//     const deletedProduct = await productModel.findByIdAndDelete(productId);

//     if (!deletedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({
//       message: "Product deleted successfully",
//       product: deletedProduct,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



// export const getProduct = async (req, res) => {
//   const { productId } = req.params;

//   try {
//     const product = await productModel.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.status(200).json({
//       success: true,
//       product,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await productModel.find();

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       products,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };