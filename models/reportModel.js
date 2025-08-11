import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    reason: { type: String, default: "", required: true },
    createdAt: { type: Date, default: Date.now }
});


export default mongoose.model("Report", reportSchema);