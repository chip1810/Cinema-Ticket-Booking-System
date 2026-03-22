const Concession = require("../models/Concession");

class ConcessionService {

  // ➕ CREATE
  async create(data) {
    return await Concession.create(data);
  }

  // 📋 GET ALL
  async getAll() {
    return await Concession.find()
      .sort({ type: 1, name: 1 }); // ASC
  }

  // 🔍 GET BY ID (Mongo dùng _id)
  async getById(id) {
    const item = await Concession.findById(id);

    if (!item) throw new Error("Concession not found");

    return item;
  }

  // ✏️ UPDATE
  async update(id, data) {
    const item = await Concession.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!item) throw new Error("Concession not found");

    return item;
  }

  // 🗑 DELETE
  async delete(id) {
    const item = await Concession.findByIdAndDelete(id);

    if (!item) throw new Error("Concession not found");

    return item;
  }

  // 📦 UPDATE STOCK
  async updateStock(id, quantity) {
    if (quantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }

    const item = await Concession.findByIdAndUpdate(
      id,
      { stockQuantity: quantity },
      { new: true }
    );

    if (!item) throw new Error("Concession not found");

    return item;
  }
}

module.exports = { ConcessionService };