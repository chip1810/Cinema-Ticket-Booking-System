import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    Unique,
    Generated,
    JoinColumn
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";
import { Seat } from "../../seat/models/Seat";
import { User } from "../../auth/models/User";
import { Order } from "../../order/models/Order";

@Entity("tickets")
@Unique(["showtimeId", "seatId"])
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
    @JoinColumn({ name: "showtimeId" })
    showtime!: Showtime;

    @ManyToOne(() => Seat)
    @JoinColumn({ name: "seatId" })
    seat!: Seat;
    @ManyToOne(() => Order, (order) => order.tickets, { onDelete: "CASCADE" })
    order!: Order;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;
    
    @Column()
    userId!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user!: User;

}