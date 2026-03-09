import { useEffect, useState } from "react";

import Hero from "../components/landingPage/Hero";
import TicketPreview from "../components/landingPage/TicketPreview";
import MovieGrid from "../components/landingPage/MovieGrid";
import Promotions from "../components/landingPage/Promotions";
import ComingSoon from "../components/landingPage/ComingSoon";
import CinemaMap from "../components/landingPage/CinemaMap";
import Vouchers from "../components/landingPage/Vouchers";
import { movieService } from "../services/movieService";

export default function Home() {
    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);

    useEffect(() => {
        movieService.getMovies()
            .then((data) => {
                console.log("API RESPONSE:", data);

                const movies = data.data;
                console.log("ALL MOVIES:", movies);

                const now = movies.filter(
                    (movie) => movie.status === "Now Showing"
                );

                const soon = movies.filter(
                    (movie) => movie.status === "Coming Soon"
                );

                console.log("NOW SHOWING:", now);
                console.log("COMING SOON:", soon);

                setNowShowing(now);
                setComingSoon(soon);
            })
            .catch((err) => console.error("FETCH ERROR:", err));
    }, []);
    return (
        <main className="flex-1 pt-24">
            <Hero />
            <TicketPreview />
            <MovieGrid movies={nowShowing} />
            <Promotions />
            <ComingSoon movies={comingSoon} />
            <Vouchers />
            <CinemaMap />
        </main>
    );
}