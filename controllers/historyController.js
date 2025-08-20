import History from "../models/historyModel";


// GET HISTORY 
export const getUserHistory = async (req, res) => {
    try {
        const userId = req.params.userId;
        const history = await History.find({ userId })
            .populate("propertyId", "title location")
            .sort({ createdAt: -1 });

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

// UPDATE HISTORY
export const updateHistory = async (req, res) => {
    try {
        const { action, endDate, notes, status } = req.body;
        const historyId = req.params.historyId;

        const updatedHistory = await History.findByIdAndUpdate(
            historyId,
            { action, endDate, notes, status },
            { new: true }
        );

        if (!updatedHistory) {
            return res.status(404).json({ message: "History not found" });
        }

        res.json(updatedHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// DELETE HISTORY
export const deleteHistory = async (req, res) => {
    try {
        const historyId = req.params.historyId;
        const deletedHistory = await History.findByIdAndDelete(historyId);

        if (!deletedHistory) {
            return res.status(404).json({ message: "History not found" });
        }

        res.json({ message: "History deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET HISTORY BY PROPERTY
export const getHistoryByProperty = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const history = await History.find({ propertyId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
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