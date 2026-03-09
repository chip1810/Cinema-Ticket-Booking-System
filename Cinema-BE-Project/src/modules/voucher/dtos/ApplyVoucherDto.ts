import { IsUUID, IsNumber, Min, IsString, IsOptional } from "class-validator";

export class ApplyVoucherDTO {

    @IsUUID()
    voucherUUID!: string;


    @IsOptional()
    @IsString()
    code?: string;

    @IsNumber()
    @Min(0)
    totalAmount!: number;
}
