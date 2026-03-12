const BASE_URL = (`http://localhost:3000`);
console.log("BASE_URL:", import.meta.env.VITE_BASE_URL);
export const movieService = {
    async getMovies() {
        const res = await fetch(`${BASE_URL}/api/movies`);
        if (!res.ok) {
            throw new Error("Failed to fetch movies");
        }
        return res.json();
    }
};