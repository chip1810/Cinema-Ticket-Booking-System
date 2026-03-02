import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from "typeorm";
import { Concession } from "../../concession/models/Concession";
import { Order } from "../../order/models/Order";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order!: Order;

  @ManyToOne(() => Concession)
  concession!: Concession;

  @Column("int")
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number; // snapshot price
}