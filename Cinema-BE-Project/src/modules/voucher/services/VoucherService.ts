import { AppDataSource } from "../../../data-source";
import { Voucher } from "../models/Voucher";
import { VoucherUsage } from "../models/VoucherUsage";
import { CreateVoucherDTO } from "../dtos/CreateVoucherDto";
import { UpdateVoucherDTO } from "../dtos/UpdateVoucherDto";
import { ApplyVoucherDTO } from "../dtos/ApplyVoucherDto";

export class VoucherService {
    private voucherRepo = AppDataSource.getRepository(Voucher);
    private usageRepo = AppDataSource.getRepository(VoucherUsage);

    // ================= CREATE =================
    async create(dto: CreateVoucherDTO) {
        if (new Date(dto.startDate) >= new Date(dto.endDate)) {
            throw new Error("Start date must be before end date");
        }

        const existing = await this.voucherRepo.findOne({
            where: { code: dto.code },
        });

        if (existing) {
            throw new Error("Voucher code already exists");
        }

        const voucher = this.voucherRepo.create({
            ...dto,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
        });

        return await this.voucherRepo.save(voucher);
    }

    // ================= GET ALL =================
    async findAll() {
        return await this.voucherRepo.find({
            order: { createdAt: "DESC" },
        });
    }

    // ================= GET BY UUID =================
    async findByUUID(uuid: string) {
        const voucher = await this.voucherRepo.findOne({
            where: { UUID: uuid },
        });

        if (!voucher) {
            throw new Error("Voucher not found");
        }

        return voucher;
    }

    // ================= UPDATE =================
    async update(uuid: string, dto: UpdateVoucherDTO) {
        const voucher = await this.findByUUID(uuid);

        if (dto.startDate && dto.endDate) {
            if (new Date(dto.startDate) >= new Date(dto.endDate)) {
                throw new Error("Start date must be before end date");
            }
        }

        Object.assign(voucher, {
            ...dto,
            startDate: dto.startDate
                ? new Date(dto.startDate)
                : voucher.startDate,
            endDate: dto.endDate
                ? new Date(dto.endDate)
                : voucher.endDate,
        });

        return await this.voucherRepo.save(voucher);
    }

    // ================= DELETE =================
    async delete(uuid: string) {
        const voucher = await this.findByUUID(uuid);
        await this.voucherRepo.remove(voucher);
    }

    // ================= APPLY (preview only) =================
    async apply(dto: ApplyVoucherDTO, userId: number) {
        const voucher = await this.findByUUID(dto.voucherUUID);

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

        // ✅ Check per user limit
        const usageCount = await this.usageRepo.count({
            where: {
                voucherId: voucher.id,
                userId,
            },
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
            discount =
                (dto.totalAmount * Number(voucher.value)) / 100;

            if (
                voucher.maxDiscountAmount &&
                discount > Number(voucher.maxDiscountAmount)
            ) {
                discount = Number(voucher.maxDiscountAmount);
            }
        } else {
            discount = Number(voucher.value);
        }

        const finalAmount = Math.max(
            dto.totalAmount - discount,
            0
        );

        return {
            originalAmount: dto.totalAmount,
            discountAmount: discount,
            finalAmount,
        };
    }

    // ================= INCREASE USED COUNT =================
    async increaseUsedCount(uuid: string, userId: number) {
        const voucher = await this.findByUUID(uuid);

        if (
            voucher.usageLimit > 0 &&
            voucher.usedCount >= voucher.usageLimit
        ) {
            throw new Error("Voucher exhausted");
        }

        voucher.usedCount += 1;
        await this.voucherRepo.save(voucher);

        await this.usageRepo.save({
            voucherId: voucher.id,
            userId,
        });
    }
}
