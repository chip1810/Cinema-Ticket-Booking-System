import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ConcessionItemDTO } from "./ConcessionItemDTO";
import { IsUUID } from "class-validator";

export class ConfirmBookingDTO {

  @IsString()
  showtimeUUID!: string;

  @IsArray()
  @IsString({ each: true })
  seatUUIDs!: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConcessionItemDTO)
  concessions!: ConcessionItemDTO[];

  @IsOptional()
  @IsUUID()
  voucherUUID?: string;

  @IsOptional()
  @IsString()
  voucherCode?: string;
}