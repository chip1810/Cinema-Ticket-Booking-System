const mongoose = require("mongoose");
const CinemaBranch = require("../models/CinemaBranch");
const Hall = require("../../hall/models/Hall");
const { User, UserRole } = require("../../auth/models/User");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const findByIdOrUUID = async (id) => {
  const branch = await CinemaBranch.findOne({
    $or: [
      { UUID: id },
      ...(isObjectId(id) ? [{ _id: id }] : []),
    ],
  });
  if (!branch) throw new Error("Branch not found");
  return branch;
};

class CinemaBranchService {
  async create(data) {
    const existing = await CinemaBranch.findOne({ name: data.name });
    if (existing) throw new Error("Branch name already exists");
    return CinemaBranch.create(data);
  }

  async findAll() {
    return CinemaBranch.find().sort({ name: 1 });
  }

  async findById(id) {
    return findByIdOrUUID(id);
  }

  async update(id, data) {
    const branch = await findByIdOrUUID(id);
    Object.assign(branch, data);
    return branch.save();
  }

  /** Chi tiết chi nhánh: thông tin + danh sách phòng chiếu + nhân viên/manager thuộc chi nhánh */
  async getDetail(id) {
    const branch = await findByIdOrUUID(id);
    const branchDoc = branch.toObject ? branch.toObject() : branch;

    const halls = await Hall.find({ branch: branch._id })
      .select("UUID name capacity type")
      .sort({ name: 1 })
      .lean();

    const staffUsers = await User.find({
      branch: branch._id,
      role: { $in: [UserRole.STAFF, UserRole.MANAGER] },
    })
      .select("UUID email fullName phoneNumber role isBlocked passwordPlainForAdmin")
      .sort({ role: 1, fullName: 1 })
      .lean();

    const managers = staffUsers.filter((u) => u.role === UserRole.MANAGER);
    const staffOnly = staffUsers.filter((u) => u.role === UserRole.STAFF);

    return {
      branch: branchDoc,
      halls,
      managers,
      staff: staffOnly,
      staffAll: staffUsers,
    };
  }
}

module.exports = CinemaBranchService;
