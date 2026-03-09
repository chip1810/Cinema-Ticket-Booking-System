import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MovieHero from "../components/movieDetail/MovieHero";
import MovieInfo from "../components/movieDetail/MovieInfo";
import ShowtimeSection from "../components/movieDetail/ShowtimeSection";

export default function MovieDetail() {
  const { uuid } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/movies/${uuid}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data.data);
      })
      .catch((err) => console.error(err));
  }, [uuid]);

  if (!movie) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="bg-background-dark text-white min-h-screen">
      <MovieHero movie={movie} />
      <MovieInfo movie={movie} />
      <ShowtimeSection showtimes={movie.showtimes} />
    </div>
  );
}