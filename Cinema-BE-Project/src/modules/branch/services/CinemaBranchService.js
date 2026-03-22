const mongoose = require("mongoose");
const CinemaBranch = require("../models/CinemaBranch");

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
}

module.exports = CinemaBranchService;
