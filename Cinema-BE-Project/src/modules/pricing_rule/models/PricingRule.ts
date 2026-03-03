import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";
import { SeatType } from "../../seat/models/enums/SeatType";

@Entity("pricing_rules")
@Unique(["showtime", "seatType"])
export class PricingRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  showtimeId!: number;

  @ManyToOne(() => Showtime, { onDelete: "CASCADE" })
  @JoinColumn({ name: "showtimeId" })
  showtime!: Showtime;

  @Column({
    type: "enum",
    enum: SeatType,
  })
  seatType!: SeatType;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;
}