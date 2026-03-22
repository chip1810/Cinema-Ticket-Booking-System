const bcrypt = require("bcryptjs");
const { User, UserRole } = require("../../auth/models/User");

class StaffManagementService {

  // 🆕 CREATE STAFF
  async createStaff(data) {
    const existing = await User.findOne({ email: data.email });

    if (existing) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const staff = await User.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      role: UserRole.STAFF,
      isBlocked: false
    });

    // ❌ không trả password
    const { password, ...safeStaff } = staff.toObject();

    return safeStaff;
  }

  // 📋 GET ALL STAFF
  async getAllStaff() {
    const staffs = await User.find({ role: UserRole.STAFF })
      .select("-password -resetPasswordOTP -resetPasswordExpires") // bỏ field nhạy cảm
      .lean();

    return staffs;
  }
}

module.exports = { StaffManagementService };