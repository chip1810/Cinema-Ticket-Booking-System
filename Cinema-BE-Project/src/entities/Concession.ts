import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum ConcessionType {
    FOOD = "Food",
    DRINK = "Drink",
    COMBO = "Combo",
}

@Entity("concessions")
export class Concession {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ type: "enum", enum: ConcessionType })
    type!: ConcessionType;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @Column({ type: "int", default: 0 })
    stockQuantity!: number;

    @Column({ nullable: true })
    imageUrl?: string;
}
