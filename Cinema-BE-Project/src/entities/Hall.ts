import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Showtime } from "./Showtime";

@Entity("halls")
export class Hall {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ type: "int" })
    capacity!: number;

    @Column({ nullable: true })
    type?: string; // Standard | IMAX | VIP

    @OneToMany(() => Showtime, (showtime) => showtime.hall)
    showtimes!: Showtime[];
}
