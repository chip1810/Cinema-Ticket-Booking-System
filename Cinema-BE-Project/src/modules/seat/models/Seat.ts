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
@Unique(["hallId", "seatNumber"])
export class Seat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  UUID!: string;

  @Column()
  seatNumber!: string;

  @Column({
    type: "enum",
    enum: SeatType,
    default: SeatType.NORMAL,
  })
  type!: SeatType;

  // 👇 THÊM CÁI NÀY
  @Column()
  hallId!: number;

  @ManyToOne(() => Hall, { onDelete: "CASCADE" })
  hall!: Hall;
}