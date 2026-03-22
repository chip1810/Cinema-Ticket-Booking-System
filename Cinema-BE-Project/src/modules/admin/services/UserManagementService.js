const mongoose = require("mongoose");
const { User, UserRole } = require("../../auth/models/User");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

class UserManagementService {
  async getAllCustomers() {
    return User.find({ role: UserRole.CUSTOMER }).select("UUID email fullName phoneNumber isBlocked");
  }

  async blockUser(userId) {
    const user = await User.findOne({
      $or: [
        { UUID: userId },
        ...(isObjectId(userId) ? [{ _id: userId }] : []),
      ],
    });

    if (!user) throw new Error("User not found");

    user.isBlocked = true;
    return user.save();
  }
}

module.exports = UserManagementService;
