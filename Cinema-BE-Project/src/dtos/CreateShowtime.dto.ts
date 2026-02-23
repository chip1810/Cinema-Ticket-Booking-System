import { IsNotEmpty, IsInt, IsDateString } from "class-validator";
import { Type } from "class-transformer";

export class CreateShowtimeDTO {
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    movieId!: number;

    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    hallId!: number;

    @IsNotEmpty()
    @IsDateString()
    startTime!: string;
}
