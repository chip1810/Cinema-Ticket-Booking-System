const mongoose = require("mongoose");
const Voucher = require("../models/Voucher");
const VoucherUsage = require("../models/VoucherUsage");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

class VoucherService {
  async create(dto) {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new Error("Start date must be before end date");
    }

    const code = dto.code?.trim().toUpperCase();
    const existing = await Voucher.findOne({ code });
    if (existing) throw new Error("Voucher code already exists");

    const voucher = await Voucher.create({
      ...dto,
      code,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });

    return voucher;
  }

  async findAll() {
    return Voucher.find().sort({ createdAt: -1 });
  }

  async findByUUID(uuid) {
    const voucher = await Voucher.findOne({ UUID: uuid });
    if (!voucher) throw new Error("Voucher not found");
    return voucher;
  }

  async findByCode(code) {
    const voucher = await Voucher.findOne({ code: code.trim().toUpperCase() });
    if (!voucher) throw new Error("Voucher not found");
    return voucher;
  }

  async update(uuid, dto) {
    const voucher = await this.findByUUID(uuid);

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new Error("Start date must be before end date");
      }
    }

    Object.assign(voucher, {
      ...dto,
      code: dto.code ? dto.code.trim().toUpperCase() : voucher.code,
      startDate: dto.startDate ? new Date(dto.startDate) : voucher.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : voucher.endDate,
    });

    return voucher.save();
  }

  async delete(uuid) {
    const voucher = await this.findByUUID(uuid);
    await Voucher.deleteOne({ _id: voucher._id });
  }

  async apply(dto, userId) {
    let voucher;

    if (dto.voucherUUID) {
      voucher = await this.findByUUID(dto.voucherUUID);
    } else if (dto.code && dto.code.trim()) {
      voucher = await this.findByCode(dto.code);
    } else {
      throw new Error("Can co voucherUUID hoac code");
    }

    const now = new Date();

    if (!voucher.isActive) throw new Error("Voucher is inactive");
    if (now < voucher.startDate || now > voucher.endDate) throw new Error("Voucher expired");
    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      throw new Error("Voucher usage exceeded");
    }

    const userObjectId = isObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
    if (userObjectId) {
      const usageCount = await VoucherUsage.countDocuments({
        voucher: voucher._id,
        user: userObjectId,
      });

      if (usageCount >= voucher.perUserLimit) {
        throw new Error("User exceeded voucher usage limit");
      }
    }

    const totalAmount = Number(dto.totalAmount);
    if (Number.isNaN(totalAmount)) throw new Error("Invalid totalAmount");

    if (voucher.minOrderValue && totalAmount < Number(voucher.minOrderValue)) {
      throw new Error("Order value not enough");
    }

    let discount = 0;
    if (voucher.type === "PERCENTAGE") {
      discount = (totalAmount * Number(voucher.value)) / 100;
      if (voucher.maxDiscountAmount && discount > Number(voucher.maxDiscountAmount)) {
        discount = Number(voucher.maxDiscountAmount);
      }
    } else {
      discount = Number(voucher.value);
    }

    const finalAmount = Math.max(totalAmount - discount, 0);

    return {
      originalAmount: totalAmount,
      discountAmount: discount,
      finalAmount,
    };
  }

  async increaseUsedCount(uuid, userId) {
    const voucher = await this.findByUUID(uuid);

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      throw new Error("Voucher exhausted");
    }

    voucher.usedCount += 1;
    await voucher.save();

    if (isObjectId(userId)) {
      await VoucherUsage.create({ voucher: voucher._id, user: userId });
    }
  }
}

module.exports = VoucherService;
