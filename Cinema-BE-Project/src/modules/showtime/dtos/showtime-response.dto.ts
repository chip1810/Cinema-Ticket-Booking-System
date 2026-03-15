import { ShowtimeStatus } from "../models/enums/showtime-status";

export class ShowtimeResponseDto {
    id!: number;
    UUID!: string;
    startTime!: Date;
    endTime!: Date;
    status!: ShowtimeStatus;

    movie!: {
        UUID: string;
        title: string;
        duration: number;
        posterUrl?: string;
    };

    hall!: {
        UUID: string;
        name: string;
    };
}
