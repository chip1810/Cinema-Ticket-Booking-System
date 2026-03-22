const Voucher = require("../models/Voucher");
const VoucherUsage = require("../models/VoucherUsage");

class VoucherService {

  // ================= CREATE =================
  async create(data) {
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error("Start date must be before end date");
    }

    const existing = await Voucher.findOne({
      code: data.code.toUpperCase()
    });

    if (existing) {
      throw new Error("Voucher code already exists");
    }

    const voucher = await Voucher.create({
      ...data,
      code: data.code.toUpperCase(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      usedCount: 0,
    });

    return voucher;
  }

  // ================= GET ALL =================
  async findAll() {
    return await Voucher.find().sort({ createdAt: -1 });
  }

  // ================= GET BY UUID =================
  async findByUUID(uuid) {
    const voucher = await Voucher.findOne({ uuid });

    if (!voucher) {
      throw new Error("Voucher not found");
    }

    return voucher;
  }

  // ================= GET BY CODE =================
  async findByCode(code) {
    const voucher = await Voucher.findOne({
      code: code.trim().toUpperCase()
    });

    if (!voucher) {
      throw new Error("Voucher not found");
    }

    return voucher;
  }

  // ================= UPDATE =================
  async update(uuid, data) {
    const voucher = await this.findByUUID(uuid);

    if (data.startDate && data.endDate) {
      if (new Date(data.startDate) >= new Date(data.endDate)) {
        throw new Error("Start date must be before end date");
      }
    }

    const updated = await Voucher.findOneAndUpdate(
      { uuid },
      {
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate)
          : voucher.startDate,
        endDate: data.endDate
          ? new Date(data.endDate)
          : voucher.endDate,
      },
      { new: true }
    );

    return updated;
  }

  // ================= DELETE =================
  async delete(uuid) {
    const voucher = await Voucher.findOneAndDelete({ uuid });

    if (!voucher) {
      throw new Error("Voucher not found");
    }
  }

  // ================= APPLY =================
  async apply(dto, userId) {
    let voucher;

    if (dto.voucherUUID) {
      voucher = await this.findByUUID(dto.voucherUUID);
    } else if (dto.code && dto.code.trim()) {
      voucher = await this.findByCode(dto.code);
    } else {
      throw new Error("Cần có voucherUUID hoặc code");
    }

    const now = new Date();

    if (!voucher.isActive) {
      throw new Error("Voucher is inactive");
    }

    if (now < voucher.startDate || now > voucher.endDate) {
      throw new Error("Voucher expired");
    }

    if (
      voucher.usageLimit > 0 &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      throw new Error("Voucher usage exceeded");
    }

    // ✅ per user limit
    const usageCount = await VoucherUsage.countDocuments({
      voucherId: voucher._id,
      userId
    });

    if (usageCount >= voucher.perUserLimit) {
      throw new Error("User exceeded voucher usage limit");
    }

    if (
      voucher.minOrderValue &&
      dto.totalAmount < Number(voucher.minOrderValue)
    ) {
      throw new Error("Order value not enough");
    }

    let discount = 0;

    if (voucher.type === "PERCENTAGE") {
      discount = (dto.totalAmount * Number(voucher.value)) / 100;

      if (
        voucher.maxDiscountAmount &&
        discount > Number(voucher.maxDiscountAmount)
      ) {
        discount = Number(voucher.maxDiscountAmount);
      }
    } else {
      discount = Number(voucher.value);
    }

    const finalAmount = Math.max(dto.totalAmount - discount, 0);

    return {
      originalAmount: dto.totalAmount,
      discountAmount: discount,
      finalAmount,
    };
  }

  // ================= INCREASE USED COUNT =================
  async increaseUsedCount(uuid, userId) {
    const voucher = await this.findByUUID(uuid);

    if (
      voucher.usageLimit > 0 &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      throw new Error("Voucher exhausted");
    }

    voucher.usedCount += 1;
    await voucher.save();

    await VoucherUsage.create({
      voucherId: voucher._id,
      userId
    });
  }
}

module.exports = { VoucherService };