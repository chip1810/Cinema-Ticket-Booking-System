import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Generated,
  JoinColumn,
  Index
} from "typeorm";
import { Hall } from "../../hall/models/Hall";
import { SeatType } from "./enums/SeatType";

@Entity("seats")
@Unique(["hallId", "seatNumber"])
@Index(["hallId"])
export class Seat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  UUID!: string;

  @Column()
  seatNumber!: string;

  // Tọa độ ma trận ghế (hàng, cột)
  @Column({ type: "int", nullable: true })
  row?: number;

  @Column({ type: "int", nullable: true })
  col?: number;

  @Column({
    type: "enum",
    enum: SeatType,
    default: SeatType.NORMAL,
  })
  type!: SeatType;

  // 👇 THÊM CÁI NÀY
  @Column()
  hallId!: number;

  @ManyToOne(() => Hall, (hall) => hall.seats, { onDelete: "CASCADE" })
  @JoinColumn({ name: "hallId" })
  hall!: Hall;
}