import { IsOptional, IsDateString, IsEnum } from "class-validator";
import { ShowtimeStatus } from "../models/enums/showtime-status";

export class UpdateShowtimeDto {
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsEnum(ShowtimeStatus)
    status?: ShowtimeStatus;
}
