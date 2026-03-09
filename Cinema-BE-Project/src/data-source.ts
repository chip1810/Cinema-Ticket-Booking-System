import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

import { User } from "./modules/auth/models/User";
import { Movie } from "./modules/movie/models/Movie";
import { Genre } from "./modules/genre/models/Genre";
import { Showtime } from "./modules/showtime/models/Showtime";
import { Hall } from "./modules/hall/models/Hall";
import { Concession } from "./modules/concession/models/Concession";
import { Seat } from "./modules/seat/models/Seat";
import { SeatHold } from "./modules/seat/models/SeatHold";
import { PricingRule } from "./modules/pricing_rule/models/PricingRule";
import { Ticket } from "./modules/ticket/models/Ticket";
import { Order } from "./modules/order/models/Order";
import { OrderItem } from "./modules/order_item/models/OrderItem";
import { Voucher } from "./modules/voucher/models/Voucher";
import { VoucherUsage } from "./modules/voucher/models/VoucherUsage";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    synchronize: true,
    logging: true,
    entities: [User, Movie, Genre, Showtime, Hall, Concession, Seat, SeatHold, PricingRule, Ticket, Order, OrderItem, Voucher, VoucherUsage],
});