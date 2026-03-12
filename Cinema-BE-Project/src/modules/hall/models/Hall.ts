import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Generated,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Showtime } from "../../showtime/models/Showtime";
import { CinemaBranch } from "../../branch/models/CinemaBranch";

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

    @ManyToOne(() => CinemaBranch, (branch) => branch.halls, { nullable: true })
    @JoinColumn({ name: "branch_id" })
    branch?: CinemaBranch;

    @OneToMany(() => Showtime, (showtime) => showtime.hall)
    showtimes!: Showtime[];
}
