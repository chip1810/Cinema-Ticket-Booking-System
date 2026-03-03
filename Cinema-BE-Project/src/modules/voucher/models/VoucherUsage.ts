import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
    Index,
} from "typeorm";
import { Voucher } from "./Voucher";
import { User } from "../../auth/models/User";

@Entity("voucher_usages")
@Index(["voucherId", "userId"])// mỗi user chỉ dùng N lần
@Index(["voucherId"])
export class VoucherUsage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Voucher, { onDelete: "CASCADE" })
  @JoinColumn({ name: "voucherId" })
  voucher!: Voucher;

  @Column()
  voucherId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number;

  @CreateDateColumn()
  usedAt!: Date;
}
