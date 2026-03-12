import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from "typeorm";
import { Hall } from "../../hall/models/Hall";

@Entity("cinema_branches")
export class CinemaBranch {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true, generated: "uuid" })
    UUID!: string;

    @Column({ unique: true })
    name!: string;

    @Column()
    address!: string;

    @Column()
    hotline!: string;

    @OneToMany(() => Hall, (hall) => hall.branch)
    halls!: Hall[];
}

