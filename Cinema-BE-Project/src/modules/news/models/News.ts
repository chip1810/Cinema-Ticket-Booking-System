import { Entity, PrimaryGeneratedColumn, Column, Generated, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum NewsType { NEWS = "NEWS", PROMOTION = "PROMOTION", EVENT = "EVENT" }
export enum NewsStatus { DRAFT = "DRAFT", PUBLISHED = "PUBLISHED", ARCHIVED = "ARCHIVED" }

@Entity("news")
export class News {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column()
    title!: string;

    @Column("text")
    content!: string;

    @Column({ type: "enum", enum: NewsType, default: NewsType.NEWS })
    type!: NewsType;

    @Column({ type: "enum", enum: NewsStatus, default: NewsStatus.DRAFT })
    status!: NewsStatus;

    @Column({ nullable: true })
    thumbnailUrl?: string;

    @Column({ type: "timestamptz", nullable: true })
    publishedAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
