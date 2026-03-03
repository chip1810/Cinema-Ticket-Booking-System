import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Unique,
    JoinColumn
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";
import { Seat } from "./Seat";
import { User } from "../../auth/models/User";

@Entity("seat_holds")
@Unique(["showtimeId", "seatId"])
export class SeatHold {
    @PrimaryGeneratedColumn()
    id!: number;

    // 👇 THÊM FK COLUMN EXPLICIT
    @Column()
    showtimeId!: number;

    @Column()
    seatId!: number;

    @ManyToOne(() => Showtime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "showtimeId" })
    showtime!: Showtime;

    @ManyToOne(() => Seat, { onDelete: "CASCADE" })
    @JoinColumn({ name: "seatId" })
    seat!: Seat;

    @ManyToOne(() => User, { nullable: true })
    user!: User;

    @Column({ type: "timestamptz" })
    expiresAt!: Date;

    @CreateDateColumn({ type: "timestamptz"})
    createdAt!: Date;
}