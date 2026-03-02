import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

import { User } from "./modules/auth/models/User";
import { Movie } from "./modules/movie/models/Movie";
import { Genre } from "./modules/genre/models/Genre";
import { Showtime } from "./modules/showtime/models/Showtime";
import { Hall } from "./modules/hall/models/Hall";
import { Concession } from "./modules/concession/models/Concession";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    synchronize: false,
    logging: true,
    entities: [User, Movie, Genre, Showtime, Hall, Concession],
});