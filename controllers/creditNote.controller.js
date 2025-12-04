// import CreditNote from "../models/creditNote.model.js";
// export const createCreditNote = async (req, res) => {
//   try {
//     const data = req.body;

//     // Save new credit note
//     const newCreditNote = await CreditNote.create(data);

//     res.status(201).json({
//       success: true,
//       message: "Credit Note created successfully",
//       data: newCreditNote,
//     });
//   } catch (error) {
//     console.error("Error creating credit note:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create credit note",
//       error: error.message,
//     });
//   }
// };




// export const getAllCreditNotes = async (req, res) => {
//   try {
//     const creditNotes = await CreditNote.find().sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: creditNotes.length,
//       data: creditNotes,
//     });
//   } catch (error) {
//     console.error("Error fetching credit notes:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch credit notes",
//       error: error.message,
//     });
//   }
// };



import CreditNote from "../models/creditNote.model.js";

// Create a new Credit Note
export const createCreditNote = async (req, res) => {
  try {
    const { userId, ...data } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required to create a credit note",
      });
    }

    // Save new credit note
    const newCreditNote = await CreditNote.create({
      ...data,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Credit Note created successfully",
      data: newCreditNote,
    });
  } catch (error) {
    console.error("Error creating credit note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create credit note",
      error: error.message,
    });
  }
};

// Get all Credit Notes for a specific user
export const getAllCreditNotes = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required to fetch credit notes",
      });
    }

    // Fetch credit notes for the given user
    const creditNotes = await CreditNote.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: creditNotes.length,
      data: creditNotes,
    });
  } catch (error) {
    console.error("Error fetching credit notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch credit notes",
      error: error.message,
    });
  }
};
