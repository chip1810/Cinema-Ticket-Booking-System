import { IsNotEmpty, IsString, IsInt, Min, IsDateString, IsUrl, IsEnum, IsArray, IsOptional } from "class-validator";

export class CreateMovieDTO {
    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    duration!: number;

    @IsNotEmpty()
    @IsDateString()
    releaseDate!: string;

    @IsOptional()
    @IsUrl()
    posterUrl?: string;

    @IsNotEmpty()
    @IsEnum(["Now Showing", "Coming Soon"])
    status!: string;

    @IsNotEmpty()
    @IsArray()
    @IsInt({ each: true })
    genreIds!: number[];
}
