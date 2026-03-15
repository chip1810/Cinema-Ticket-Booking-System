import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../../auth/models/User";
import { Movie } from "../../movie/models/Movie";

export enum ReviewStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    HIDDEN = "Hidden",
}

@Entity("reviews")
export class Review {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: "user_id" })
    userId!: number;

    @ManyToOne(() => Movie)
    @JoinColumn({ name: "movie_id" })
    movie!: Movie;

    @Column({ name: "movie_id" })
    movieId!: number;

    @Column("int")
    rating!: number;

    @Column("text")
    comment!: string;

    @Column({
        type: "enum",
        enum: ReviewStatus,
        default: ReviewStatus.PENDING,
    })
    status!: ReviewStatus;

    @CreateDateColumn()
    createdAt!: Date;
}
