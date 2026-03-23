const mongoose = require("mongoose");
const { User, UserRole } = require("../../auth/models/User");
const CinemaBranch = require("../../branch/models/CinemaBranch");
const bcrypt = require("bcryptjs");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

async function resolveBranchId(branchId, branchUUID) {
  if (!branchId && !branchUUID) return null;
  const q = branchUUID
    ? { UUID: String(branchUUID).trim() }
    : isObjectId(branchId)
      ? { _id: branchId }
      : { UUID: branchId };
  const b = await CinemaBranch.findOne(q);
  if (!b) throw new Error("Branch not found");
  return b._id;
}

class StaffManagementService {
  async findStaffUser(userId) {
    const user = await User.findOne({
      $or: [
        { UUID: String(userId) },
        ...(isObjectId(userId) ? [{ _id: userId }] : []),
      ],
    });
    if (!user) throw new Error("User not found");
    if (![UserRole.STAFF, UserRole.MANAGER].includes(user.role)) {
      throw new Error("Chỉ áp dụng cho tài khoản nhân viên hoặc quản lý chi nhánh");
    }
    return user;
  }

  async createStaff(data) {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const role =
      data.role && [UserRole.STAFF, UserRole.MANAGER].includes(data.role)
        ? data.role
        : UserRole.STAFF;

    let branchRef = null;
    if (data.branchId || data.branchUUID) {
      branchRef = await resolveBranchId(data.branchId, data.branchUUID);
    }

    if (role === UserRole.MANAGER) {
      if (!branchRef) {
        throw new Error("Manager must be assigned to a branch (branchId or branchUUID)");
      }
      const otherManager = await User.findOne({
        role: UserRole.MANAGER,
        branch: branchRef,
      });
      if (otherManager) {
        throw new Error("This branch already has a manager. Remove or reassign the existing manager first.");
      }
    }

    const staff = await User.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      role,
      isBlocked: false,
      passwordPlainForAdmin: data.password ? String(data.password) : null,
      branch: branchRef,
    });

    const staffObj = staff.toObject();
    delete staffObj.password;
    return staffObj;
  }

  async getAllStaff(branchFilter) {
    const query = { role: { $in: [UserRole.STAFF, UserRole.MANAGER] } };
    if (branchFilter) {
      let bid = null;
      if (mongoose.Types.ObjectId.isValid(String(branchFilter))) {
        bid = new mongoose.Types.ObjectId(String(branchFilter));
      } else {
        const b = await CinemaBranch.findOne({ UUID: String(branchFilter).trim() });
        if (!b) throw new Error("Branch not found");
        bid = b._id;
      }
      query.branch = bid;
    }

    const users = await User.find(query)
      .populate("branch", "UUID name address hotline")
      .select("UUID email fullName phoneNumber role isBlocked passwordPlainForAdmin branch");

    return users.map((u) => u.toObject());
  }

  /**
   * Cập nhật nhân viên: email, họ tên, SĐT, vai trò (staff/manager), chi nhánh, mật khẩu (tuỳ chọn).
   */
  async updateStaff(userId, data) {
    const user = await this.findStaffUser(userId);
    const {
      email,
      fullName,
      phoneNumber,
      role: roleInput,
      branchId,
      branchUUID,
      password,
    } = data || {};

    const branchExplicit = branchId !== undefined || branchUUID !== undefined;

    if (email !== undefined) {
      if (
        !email ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !email.endsWith("@gmail.com")
      ) {
        throw new Error("Email must be a valid gmail address (@gmail.com)");
      }
      const dup = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
      if (dup) throw new Error("Email already exists");
      user.email = email.trim();
    }

    if (fullName !== undefined) {
      user.fullName = fullName || undefined;
    }

    if (phoneNumber !== undefined) {
      if (phoneNumber && (typeof phoneNumber !== "string" || !/^0\d{9}$/.test(phoneNumber))) {
        throw new Error("Phone number must be 10 digits and start with 0");
      }
      if (phoneNumber) {
        const ph = await User.findOne({ phoneNumber, _id: { $ne: user._id } });
        if (ph) throw new Error("Phone number already in use");
      }
      user.phoneNumber = phoneNumber || undefined;
    }

    let newRole = user.role;
    if (roleInput !== undefined) {
      if (![UserRole.STAFF, UserRole.MANAGER].includes(roleInput)) {
        throw new Error("Invalid role: only staff or manager");
      }
      newRole = roleInput;
    }

    let branchRef = user.branch;
    if (branchExplicit) {
      if (!branchId && !branchUUID) {
        branchRef = null;
      } else {
        branchRef = await resolveBranchId(branchId, branchUUID);
      }
    }

    if (newRole === UserRole.MANAGER) {
      if (!branchRef) {
        throw new Error("Manager must be assigned to a branch (branchId or branchUUID)");
      }
      const otherManager = await User.findOne({
        role: UserRole.MANAGER,
        branch: branchRef,
        _id: { $ne: user._id },
      });
      if (otherManager) {
        throw new Error("This branch already has a manager. Remove or reassign the existing manager first.");
      }
    }

    user.role = newRole;
    user.branch = branchRef;

    if (password !== undefined && String(password).trim()) {
      const plain = String(password);
      user.password = await bcrypt.hash(plain, 10);
      user.passwordPlainForAdmin = plain;
    }

    await user.save();

    const updated = await User.findById(user._id)
      .populate("branch", "UUID name address hotline")
      .select("UUID email fullName phoneNumber role isBlocked passwordPlainForAdmin branch");

    const obj = updated.toObject();
    delete obj.password;
    return obj;
  }

  async deleteStaff(userId) {
    const user = await this.findStaffUser(userId);
    await User.deleteOne({ _id: user._id });
    return { id: user._id.toString(), email: user.email };
  }

  async setStaffBlocked(userId, blocked) {
    const user = await this.findStaffUser(userId);

    user.isBlocked = !!blocked;
    await user.save();

    const updated = await User.findById(user._id)
      .populate("branch", "UUID name address hotline")
      .select("UUID email fullName phoneNumber role isBlocked passwordPlainForAdmin branch");

    const obj = updated.toObject();
    delete obj.password;
    return obj;
  }
}

module.exports = StaffManagementService;
