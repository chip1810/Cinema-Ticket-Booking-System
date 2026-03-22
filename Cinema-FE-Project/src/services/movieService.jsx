import { API_BASE_URL } from "../config/api";

const BASE_URL = API_BASE_URL;

export const movieService = {

    async getMovies() {
        const res = await fetch(`${BASE_URL}/movies`);

        if (!res.ok) {
            throw new Error("Failed to fetch movies");
        }

        return res.json();
    },

    async getMovieByUUID(uuid) {
        const res = await fetch(`${BASE_URL}/movies/uuid/${uuid}`);

        if (!res.ok) {
            throw new Error("Failed to fetch movie detail");
        }

        return res.json();
    }

};
