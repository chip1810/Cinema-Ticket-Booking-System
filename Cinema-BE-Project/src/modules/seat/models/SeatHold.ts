import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";
import { Seat } from "./Seat";
import { User } from "../../auth/models/User";

@Entity("seat_holds")
@Unique(["showtime", "seat"])
export class SeatHold {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Showtime, { onDelete: "CASCADE" })
  showtime!: Showtime;

  @ManyToOne(() => Seat, { onDelete: "CASCADE" })
  seat!: Seat;

  @ManyToOne(() => User, { nullable: true })
  user!: User;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}