import { IsUUID, IsDateString } from "class-validator";

export class CreateShowtimeDto {
    @IsUUID()
    movieUUID!: string;

    @IsUUID()
    hallUUID!: string;

    @IsDateString()
    startTime!: string;

    @IsDateString()
    endTime!: string;
}
