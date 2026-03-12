import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("system_settings")
@Unique(["key"])
export class SystemSetting {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    key!: string;

    @Column({ type: "text" })
    value!: string;
}

