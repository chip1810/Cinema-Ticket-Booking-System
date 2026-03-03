import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Movie } from "../../movie/models/Movie";
import { Hall } from "../../hall/models/Hall";

import { Generated } from "typeorm";

@Entity("showtimes")
export class Showtime {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column({ type: "timestamptz" })
    startTime!: Date;

    @Column({ type: "timestamptz" })
    endTime!: Date;

    @Column({ name: "hall_id" })
    hallId!: number;

    @ManyToOne(() => Movie, (movie) => movie.showtimes, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "movie_id" })
    movie!: Movie;

    @ManyToOne(() => Hall, (hall) => hall.showtimes)
    @JoinColumn({ name: "hall_id" })
    hall!: Hall;
}