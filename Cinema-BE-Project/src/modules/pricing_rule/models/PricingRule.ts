import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";
import { SeatType } from "../../seat/models/enums/SeatType";

@Entity("pricing_rules")
@Unique(["showtime", "seatType"])
export class PricingRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Showtime, { onDelete: "CASCADE" })
  showtime!: Showtime;

  @Column({
    type: "enum",
    enum: SeatType,
  })
  seatType!: SeatType;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;
}