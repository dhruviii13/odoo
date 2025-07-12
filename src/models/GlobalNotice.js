import mongoose from "mongoose";
const GlobalNoticeSchema = new mongoose.Schema({
  message: { type: String, required: true },
  priority: { type: String, enum: ["info","warning"], default: "info" },
}, { timestamps: { createdAt: true, updatedAt: false } });
export default mongoose.models.GlobalNotice || mongoose.model("GlobalNotice", GlobalNoticeSchema); 