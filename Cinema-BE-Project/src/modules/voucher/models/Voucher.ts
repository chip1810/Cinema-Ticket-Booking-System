import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Generated,
} from "typeorm";

import { VoucherType } from "./enums/VoucherType";

@Entity("vouchers")
export class Voucher {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column({ unique: true })
    code!: string;

    @Column({
        type: "enum",
        enum: VoucherType,
    })
    type!: VoucherType;

    @Column("decimal", { precision: 10, scale: 2 })
    value!: number; // % hoặc số tiền

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    minOrderValue?: number;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    maxDiscountAmount?: number;

    @Column({ type: "timestamp" })
    startDate!: Date;

    @Column({ type: "timestamp" })
    endDate!: Date;

    @Column({ default: 0 })
    usageLimit!: number; // tổng số lần được dùng

    @Column({ default: 0 })
    usedCount!: number;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ default: 1 })
    perUserLimit!: number;

}
