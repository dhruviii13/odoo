import mongoose from "mongoose";
const SwapSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  offeredSkill: { type: String, required: true },
  requestedSkill: { type: String, required: true },
  message: { type: String, default: "" },
  status: { type: String, enum: ["pending","accepted","rejected"], default: "pending", index: true },
}, { timestamps: true });
SwapSchema.index({ fromUser: 1, toUser: 1 });
export default mongoose.models.Swap || mongoose.model("Swap", SwapSchema); 