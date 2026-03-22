const { User, UserRole } = require("../../auth/models/User");
const bcrypt = require("bcryptjs");

class StaffManagementService {
  async createStaff(data) {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const role =
      data.role && [UserRole.STAFF, UserRole.MANAGER].includes(data.role)
        ? data.role
        : UserRole.STAFF;

    const staff = await User.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      role,
      isBlocked: false,
    });

    const staffObj = staff.toObject();
    delete staffObj.password;
    return staffObj;
  }

  async getAllStaff() {
    return User.find({ role: { $in: [UserRole.STAFF, UserRole.MANAGER] } })
      .select("UUID email fullName phoneNumber role isBlocked");
  }
}

module.exports = StaffManagementService;
