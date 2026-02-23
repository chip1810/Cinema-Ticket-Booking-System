import { IsNotEmpty, IsInt, IsDateString, IsEnum, IsOptional, IsString, IsArray } from "class-validator";

export class CalculatePriceDTO {
    @IsNotEmpty()
    @IsString()
    showtimeId!: string;

    @IsNotEmpty()
    @IsArray()
    seats!: SeatDTO[];

    @IsOptional()
    @IsString()
    discountCode?: string;
}

export class SeatDTO {
    @IsNotEmpty()
    @IsString()
    row!: string;

    @IsNotEmpty()
    @IsInt()
    number!: number;

    @IsNotEmpty()
    @IsEnum(["Standard", "VIP", "Couple"])
    type!: "Standard" | "VIP" | "Couple";
}
