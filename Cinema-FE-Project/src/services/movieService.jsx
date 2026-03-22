const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const movieService = {

    async getMovies() {
        const res = await fetch(`${BASE_URL}/api/movies`);

        if (!res.ok) {
            throw new Error("Failed to fetch movies");
        }

        return res.json();
    },

    async getMovieByUUID(uuid) {
        const res = await fetch(`${BASE_URL}/api/movies/uuid/${uuid}`);

        if (!res.ok) {
            throw new Error("Failed to fetch movie detail");
        }

        return res.json();
    }

};