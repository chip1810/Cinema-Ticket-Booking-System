import { IsUUID, IsNumber, Min } from "class-validator";

export class ApplyVoucherDTO {

    @IsUUID()
    voucherUUID!: string;

    @IsNumber()
    @Min(0)
    totalAmount!: number;
}
