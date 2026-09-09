import History from "../models/historyModel.js";

export const logHistory = async ({ userId, propertyId, role, action, notes }) => {
  try {
    const newHistory = new History({
      userId,
      propertyId,
      role,
      action,
      notes,
      startDate: Date.now(),
    });

    await newHistory.save();
    return newHistory;  // <-- return it
     
  } catch (error) {
    console.error("Error logging history:", error.message);
    throw error;  // rethrow so you can catch in controller
  }
};
