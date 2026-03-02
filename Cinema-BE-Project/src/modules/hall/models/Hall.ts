import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Generated
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";

@Entity("halls")
export class Hall {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column({ unique: true })
    name!: string;

    @Column("int")
    capacity!: number;

    @Column({ nullable: true })
    type?: string;

    @OneToMany(() => Showtime, (showtime) => showtime.hall)
    showtimes!: Showtime[];
}