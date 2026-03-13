import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MovieHero from "../components/movieDetail/MovieHero";
import MovieInfo from "../components/movieDetail/MovieInfo";
import ShowtimeSection from "../components/movieDetail/ShowtimeSection";
import { movieService } from "../services/movieService";
import Loader from "../components/common/Loading/Loader";

export default function MovieDetail() {
    const { uuid } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        if (!uuid) return;

        movieService.getMovieByUUID(uuid)
            .then((data) => {
                setMovie(data.data);
            })
            .catch((err) => console.error(err));
    }, [uuid]);

    if (!movie) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-background-dark">
                <Loader />
            </div>
        );
    }

    return (
        <div className="bg-background-dark text-white">
            <MovieHero movie={movie} />
            <MovieInfo movie={movie} />
            <ShowtimeSection showtimes={movie.showtimes} />
        </div>
    );
}