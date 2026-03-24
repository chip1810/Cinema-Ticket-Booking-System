import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Generated } from "typeorm";
import { Seat } from "../../seat/models/Seat";
import { Showtime } from "../../showtime/models/Showtime";

export enum HallType {
    STANDARD = "STANDARD",
    IMAX = "IMAX",
    VIP = "VIP",
    _4DX = "4DX",
}

@Entity("halls")
export class Hall {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ type: "enum", enum: HallType, default: HallType.STANDARD })
    type!: HallType;

    @Column({ type: "int" })
    capacity!: number;

    @OneToMany(() => Seat, seat => seat.hall)
    seats!: Seat[];

    @OneToMany(() => Showtime, showtime => showtime.hall)
    showtimes!: Showtime[];
}