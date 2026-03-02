import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Genre } from "./Genre";
import { Showtime } from "./Showtime";

export enum MovieStatus {
  NOW_SHOWING = "Now Showing",
  COMING_SOON = "Coming Soon",
}

@Entity("movies")
export class Movie {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column("int")
  duration!: number;

  @Column({ type: "date" })
  releaseDate!: Date;

  @Column({ nullable: true })
  posterUrl?: string;

  @Column({
    type: "enum",
    enum: MovieStatus,
    default: MovieStatus.COMING_SOON,
  })
  status!: MovieStatus;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable({
    name: "movie_genres",
  })
  genres!: Genre[];

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes!: Showtime[];
}