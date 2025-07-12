import mongoose from "mongoose";
const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  swap: { type: mongoose.Schema.Types.ObjectId, ref: "Swap", required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
}, { timestamps: true });
FeedbackSchema.index({ swap: 1 });
FeedbackSchema.index({ user: 1 });
export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema); 