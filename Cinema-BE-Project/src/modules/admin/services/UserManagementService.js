const { User, UserRole } = require("../../auth/models/User");

class UserManagementService {

  // 📋 GET ALL CUSTOMERS
  async getAllCustomers() {
    const customers = await User.find({ role: UserRole.CUSTOMER })
      .select("-password -resetPasswordOTP -resetPasswordExpires") // bỏ field nhạy cảm
      .lean();

    return customers;
  }

  // 🔒 BLOCK USER
  async blockUser(userId) {
    // ⚠️ Mongo dùng _id (ObjectId), không phải number id
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.isBlocked = true;
    await user.save();

    const { password, resetPasswordOTP, resetPasswordExpires, ...safeUser } = user.toObject();

    return safeUser;
  }
}

module.exports = { UserManagementService };