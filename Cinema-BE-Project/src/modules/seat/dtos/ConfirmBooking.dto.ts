import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ConcessionItemDTO } from "./ConcessionItemDTO";

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
}