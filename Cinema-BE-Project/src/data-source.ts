import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

import { User } from "./modules/auth/models/User";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: true,
  logging: true,
  entities: [User],
});