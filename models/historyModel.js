import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    action: {
        type: String,
        enum: ["viewed", "saved", "shared", "applied"],
        required: true
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    notes: { type: String, trim: true },
    status: {
        type: String,
        enum: ["active", "archived"],
        default: "active"
    },
}, {
    timestamps: true
});
export default mongoose.model("History", historySchema);