import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    Generated
} from "typeorm";
import { Movie } from "../../movie/models/Movie";

@Entity("genres")
export class Genre {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "uuid", unique: true })
    @Generated("uuid")
    UUID!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @ManyToMany(() => Movie, (movie) => movie.genres)
    movies!: Movie[];
}