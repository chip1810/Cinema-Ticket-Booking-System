import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";
import { AppDataSource } from "./data-source";

// Controllers
import { AuthController } from "./modules/auth/controllers/AuthController";
import { MovieController } from "./modules/movie/controllers/MovieController";
import { ShowtimeController } from "./controllers/ShowtimeController";
import { ConcessionController } from "./controllers/ConcessionController";
import { PricingController } from "./controllers/PricingController";

// Seed entities
import { Hall } from "./modules/hall/models/Hall";
import { Genre } from "./modules/genre/models/Genre";
// Routes
import showtimeRoutes from "./modules/showtime/routes/showtimeRoutes";
import seatRoutes from "./modules/seat/routes/seatRoutes";

dotenv.config();

export const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/seats", seatRoutes);

// --- Controller instances ---
const auth = new AuthController();
const movie = new MovieController();
const showtime = new ShowtimeController();
const concession = new ConcessionController();
const pricing = new PricingController();

// --- Auth Routes ---
app.post("/api/auth/register", (req, res) => auth.register(req, res));
app.post("/api/auth/login", (req, res) => auth.login(req, res));
app.post("/api/auth/forgot-password", (req, res) => auth.forgotPassword(req, res));
app.post("/api/auth/reset-password", (req, res) => auth.resetPassword(req, res));

// --- Movie Routes ---
app.get("/api/movies", (req, res) => movie.getAll(req, res));
app.get("/api/movies/:id", (req, res) => movie.getById(req, res));
app.post("/api/movies", (req, res) => movie.create(req, res));
app.put("/api/movies/:id", (req, res) => movie.update(req, res));
app.delete("/api/movies/:id", (req, res) => movie.delete(req, res));

// --- Showtime Routes ---
app.get("/api/showtimes", (req, res) => showtime.getAll(req, res));
app.post("/api/showtimes", (req, res) => showtime.create(req, res));
app.delete("/api/showtimes/:id", (req, res) => showtime.delete(req, res));

// --- Concession Routes ---
app.get("/api/concessions", (req, res) => concession.getAll(req, res));
app.post("/api/concessions", (req, res) => concession.create(req, res));
app.put("/api/concessions/:id", (req, res) => concession.update(req, res));
app.delete("/api/concessions/:id", (req, res) => concession.delete(req, res));

// --- Pricing Route ---
app.post("/api/pricing/calculate", (req, res) => pricing.calculate(req, res));

// --- Seed Route (Dev only) ---
app.post("/api/seed", async (req: Request, res: Response) => {
    try {
        const hallRepo = AppDataSource.getRepository(Hall);
        const genreRepo = AppDataSource.getRepository(Genre);

        if (await hallRepo.count() === 0) {
            await hallRepo.save([
                { name: "Cinema 1", capacity: 100, type: "Standard" },
                { name: "Cinema 2", capacity: 80, type: "Standard" },
                { name: "IMAX Hall", capacity: 200, type: "IMAX" },
            ]);
        }
        if (await genreRepo.count() === 0) {
            await genreRepo.save([
                { name: "Action" },
                { name: "Drama" },
                { name: "Comedy" },
                { name: "Horror" },
                { name: "Sci-Fi" },
            ]);
        }
        return res.json({ message: "Seed data created successfully" });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

// --- Health Check ---
app.get("/", (_req, res) => res.json({ status: "ok", message: "Cinema API running" }));

// --- Start Server ---
const PORT = process.env.PORT || 3000;
if (require.main === module) {
    AppDataSource.initialize()
        .then(() => {
            console.log("✅ Database connected");
            app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
        })
        .catch((err) => {
            console.error("❌ Database connection failed:", err.message);
            process.exit(1);
        });
}
