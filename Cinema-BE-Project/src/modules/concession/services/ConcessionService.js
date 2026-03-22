const mongoose = require("mongoose");
const Concession = require("../models/Concession");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const findByIdOrUUID = async (id) => {
  const item = await Concession.findOne({
    $or: [
      { UUID: id },
      ...(isObjectId(id) ? [{ _id: id }] : []),
    ],
  });
  if (!item) throw new Error("Concession not found");
  return item;
};

class ConcessionService {
  async create(data) {
    return Concession.create(data);
  }

  async getAll() {
    return Concession.find().sort({ type: 1, name: 1 });
  }

  async getById(id) {
    return findByIdOrUUID(id);
  }

  async update(id, data) {
    const item = await findByIdOrUUID(id);
    Object.assign(item, data);
    return item.save();
  }

  async delete(id) {
    const item = await findByIdOrUUID(id);
    await Concession.deleteOne({ _id: item._id });
    return item;
  }

  async updateStock(id, quantity) {
    const item = await findByIdOrUUID(id);
    if (quantity < 0) throw new Error("Stock quantity cannot be negative");
    item.stockQuantity = quantity;
    return item.save();
  }
}

module.exports = ConcessionService;
