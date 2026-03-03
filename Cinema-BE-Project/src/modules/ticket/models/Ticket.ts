import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    Unique,
    Generated,
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";
import { Seat } from "../../seat/models/Seat";
import { User } from "../../auth/models/User";
import { Order } from "../../order/models/Order";

@Entity("tickets")
@Unique(["showtime", "seat"])
export class Ticket {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column()
    showtimeId!: number;   // 👈 thêm cái này

    @Column()
    seatId!: number;       // 👈 thêm cái này

    @ManyToOne(() => Showtime)
    showtime!: Showtime;

    @ManyToOne(() => Seat)
    seat!: Seat;

    @ManyToOne(() => Order, (order) => order.tickets, { onDelete: "CASCADE" })
    order!: Order;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @CreateDateColumn()
    createdAt!: Date;
}