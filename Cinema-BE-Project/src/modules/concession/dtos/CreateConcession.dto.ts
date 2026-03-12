import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";
import { ConcessionType } from "../models/enums/ConcessionType";

export class CreateConcessionDTO {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsEnum(ConcessionType)
    type!: ConcessionType;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price!: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stockQuantity!: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}