/// <reference types="jest" />
import request from "supertest";
import { app } from "../app";
import { AppDataSource } from "../data-source";

beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
});

afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
});

describe("Cinema API – Integration Tests", () => {
    let movieId: string;
    const hallId = 1;

    it("1. POST /api/seed – Seed initial data", async () => {
        const res = await request(app).post("/api/seed");
        expect(res.status).toBe(200);
        expect(res.body.message).toContain("Seed data created");
    });

    it("2. POST /api/movies – Create Movie", async () => {
        const res = await request(app).post("/api/movies").send({
            title: "Inception",
            description: "A thief who enters dreams.",
            duration: 148,
            releaseDate: "2010-07-16",
            posterUrl: "https://example.com/inception.jpg",
            status: "Now Showing",
            genreIds: [1],
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toBe("Inception");
        movieId = res.body.id;
    });

    it("3. GET /api/movies – List all movies", async () => {
        const res = await request(app).get("/api/movies");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("4. POST /api/showtimes – Create Showtime (Success)", async () => {
        // Duration: 148 min → ends 12:28 UTC. With 15min buffer → free from 12:43
        const res = await request(app).post("/api/showtimes").send({
            movieId,
            hallId,
            startTime: "2024-06-01T10:00:00.000Z",
        });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
    });

    it("5. POST /api/showtimes – Conflict Detection (should FAIL)", async () => {
        // Starts at 12:00 which is inside the window (10:00 → 12:43 with buffer)
        const res = await request(app).post("/api/showtimes").send({
            movieId,
            hallId,
            startTime: "2024-06-01T12:00:00.000Z",
        });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/conflict/i);
    });

    it("6. POST /api/showtimes – No Conflict after cleaning (Success)", async () => {
        // Starts at 13:00 – safely after the 12:43 buffer window
        const res = await request(app).post("/api/showtimes").send({
            movieId,
            hallId,
            startTime: "2024-06-01T13:00:00.000Z",
        });
        expect(res.status).toBe(201);
    });
});
