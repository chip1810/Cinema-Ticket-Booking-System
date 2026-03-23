const { Schema, model, Types } = require("mongoose");

// Object thay cho enum
const UserRole = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  CUSTOMER: "customer",
};

const UserSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null }, // Nullable for OAuth users
  role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
  fullName: { type: String },
  phoneNumber: { type: String, unique: true, sparse: true },
  isBlocked: { type: Boolean, default: false },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  authProvider: { type: String, enum: ["local", "google"], default: "local" },
}, { timestamps: true });

// Tạo model Mongoose từ schema
const User = model("User", UserSchema);

// Export cả model và object enum
module.exports = { User, UserRole };