import { Entity, PrimaryGeneratedColumn, Column, Generated } from "typeorm";

export enum ConcessionType {
  FOOD = "Food",
  DRINK = "Drink",
  COMBO = "Combo",
}

@Entity("concessions")
export class Concession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  UUID!: string;
  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: ConcessionType,
  })
  type!: ConcessionType;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column("int", { default: 0 })
  stockQuantity!: number;

  @Column({ nullable: true })
  imageUrl?: string;
}