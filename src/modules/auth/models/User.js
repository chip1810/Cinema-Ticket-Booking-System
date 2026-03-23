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
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
  fullName: { type: String },
  phoneNumber: { type: String, unique: true, sparse: true }, // sparse để nullable + unique
  isBlocked: { type: Boolean, default: false },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true }); // Tạo createdAt và updatedAt tự động

// Tạo model Mongoose từ schema
const User = model("User", UserSchema);

// Export cả model và object enum
module.exports = { User, UserRole };