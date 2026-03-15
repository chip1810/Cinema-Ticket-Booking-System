import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Movie } from "../../movie/models/Movie"; // Giả định model Movie đã tồn tại

@Entity("genres")
export class Genre {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @ManyToMany(() => Movie, movie => movie.genres)
    movies!: Movie[];
}