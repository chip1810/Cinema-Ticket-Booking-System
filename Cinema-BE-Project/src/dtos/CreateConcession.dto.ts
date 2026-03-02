import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsUrl, Min } from "class-validator";
import { Type } from "class-transformer";
import { ConcessionType } from "../modules/concession/models/Concession";

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
    @IsUrl()
    imageUrl?: string;
}
