import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Generated,
} from "typeorm";
import { User } from "../../auth/models/User";
import { Ticket } from "../../ticket/models/Ticket";
import { OrderItem } from "../../order_item/models/OrderItem";

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  UUID!: string;

  @ManyToOne(() => User, { nullable: true })
  user!: User;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column("decimal", { precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ default: "ONLINE" })
  channel!: string; // ONLINE | POS

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets!: Ticket[];

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}