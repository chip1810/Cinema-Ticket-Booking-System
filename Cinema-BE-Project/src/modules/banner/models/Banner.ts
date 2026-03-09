import { Entity, PrimaryGeneratedColumn, Column, Generated } from "typeorm";

@Entity("banners")
export class Banner {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column()
    title!: string;

    @Column()
    imageUrl!: string;

    @Column({ nullable: true })
    linkUrl?: string;             // URL khi click vào banner

    @Column({ type: "int", default: 0 })
    position!: number;            // Thứ tự hiển thị (0 = đầu tiên)

    @Column({ default: true })
    isActive!: boolean;

    @Column({ type: "timestamptz", nullable: true })
    startDate?: Date;             // Ngày bắt đầu hiển thị

    @Column({ type: "timestamptz", nullable: true })
    endDate?: Date;               // Ngày kết thúc hiển thị
}
