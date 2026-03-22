// staff.service.js
const { User, UserRole } = require("../../auth/models/User");

class StaffService {
  async lookupCustomerByPhone(phoneNumber) {
    const customer = await User.findOne({
      phoneNumber,
      role: UserRole.CUSTOMER,
    }).lean();

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Loại bỏ các thông tin nhạy cảm
    const { password, resetPasswordOTP, resetPasswordExpires, ...safeCustomer } = customer;

    return safeCustomer;
  }
}

module.exports = StaffService;