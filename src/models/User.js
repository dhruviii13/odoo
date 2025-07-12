import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  location: { type: String, default: "" },
  photoUrl: { type: String, default: "" },
  cloudinaryId: { type: String, default: "" },
  skillsOffered: { type: [String], default: [], index: true },
  skillsWanted: { type: [String], default: [], index: true },
  availability: { type: String, enum: ["Weekends","Evenings","Mornings"], required: true, index: true },
  profilePublic: { type: Boolean, default: false, index: true },
  role: { type: String, enum: ["user","admin"], default: "user" },
  isBanned: { type: Boolean, default: false, index: true },
  fcmToken: { type: String, default: null },
}, { timestamps: true });
UserSchema.index({ email: 1 });
UserSchema.index({ skillsOffered: 1 });
UserSchema.index({ skillsWanted: 1 });
UserSchema.index({ availability: 1 });
UserSchema.index({ profilePublic: 1 });
export default mongoose.models.User || mongoose.model("User", UserSchema); 