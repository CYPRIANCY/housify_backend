import History from "../models/historyModel.js";
import Property from "../models/propertyModel.js";


// GET HISTORY 
export const getUserHistory = async (req, res) => {
  try {
    let history;

    if (req.user.role === "landlord") {
      // Landlord: get history of their own properties
      const properties = await Property.find({ userId: req.user.id }).select("_id");
      const propertyIds = properties.map(p => p._id);

      history = await History.find({ propertyId: { $in: propertyIds } })
        .populate("userId", "name email")
        .populate("propertyId", "title location");
    } 
    else if (req.user.role === "admin") {
      // Admin: see all history
      history = await History.find()
        .populate("userId", "name email")
        .populate("propertyId", "title location");
    } 
    else {
      // Other roles: only their own actions
      history = await History.find({ userId: req.user.id })
        .populate("userId", "name email")
        .populate("propertyId", "title location");
    }

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET HISTORY BY ID
export const getHistoryById = async (req, res) => {
    try {
        const historyId = req.params.historyId;
        const history = await History.findById(historyId)
            .populate("userId", "name email")
            .populate("propertyId", "title location");

        if (!history) {
            return res.status(404).json({ message: "History not found" });
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD HISTORY
export const addHistory = async (req, res) => {
    try {
        const { userId, propertyId, action, startDate, endDate, notes } = req.body;

        const newHistory = new History({
            userId,
            propertyId,
            action,
            startDate: startDate || Date.now(),
            endDate,
            notes
        });

        await newHistory.save();
        res.status(201).json(newHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



