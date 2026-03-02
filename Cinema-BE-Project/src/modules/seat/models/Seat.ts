import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Generated,
} from "typeorm";
import { Hall } from "../../hall/models/Hall";
import { SeatType } from "./enums/SeatType";

@Entity("seats")
@Unique(["hall", "seatNumber"])
export class Seat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  UUID!: string;

  @Column()
  seatNumber!: string; // A1, A2

  @Column({
    type: "enum",
    enum: SeatType,
    default: SeatType.NORMAL,
  })
  type!: SeatType;

  @ManyToOne(() => Hall, { onDelete: "CASCADE" })
  hall!: Hall;
}