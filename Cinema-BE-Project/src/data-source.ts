import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Genre } from "./entities/Genre";
import { Movie } from "./entities/Movie";
import { Hall } from "./entities/Hall";
import { Showtime } from "./entities/Showtime";
import { Concession } from "./entities/Concession";
import { User } from "./entities/User";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cinema_db",
    synchronize: true,
    logging: false,
    entities: [Genre, Movie, Hall, Showtime, Concession, User],
});
