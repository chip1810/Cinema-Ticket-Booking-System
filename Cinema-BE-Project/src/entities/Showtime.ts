import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Movie } from "./Movie";
import { Hall } from "./Hall";

@Entity("showtimes")
export class Showtime {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    startTime!: Date;

    @Column()
    endTime!: Date; // Movie end time (Cleaning buffer handled in service logic)

    @ManyToOne(() => Movie, (movie) => movie.showtimes, { eager: true })
    movie!: Movie;

    @ManyToOne(() => Hall, (hall) => hall.showtimes, { eager: false })
    hall!: Hall;
}
