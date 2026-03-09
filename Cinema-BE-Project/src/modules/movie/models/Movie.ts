import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  Generated,
} from "typeorm";
import { Genre } from "../../genre/models/Genre";
import { Showtime } from "../../showtime/models/Showtime";
import { MovieStatus } from "./enums/MovieStatus";

@Entity("movies")
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  UUID!: string;

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

  @Column({ nullable: true })
  bannerUrl?: string;

  @Column("decimal", { precision: 2, scale: 1, nullable: true })
  rating?: number;

  @Column({
    type: "enum",
    enum: MovieStatus,
    default: MovieStatus.COMING_SOON,
  })
  status!: MovieStatus;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable({
    name: "movie_genres",
  })
  genres!: Genre[];

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes!: Showtime[];

}