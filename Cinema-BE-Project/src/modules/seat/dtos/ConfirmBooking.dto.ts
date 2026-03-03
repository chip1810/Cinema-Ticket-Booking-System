import { IsArray, IsString } from "class-validator";

export class ConfirmBookingDTO {

  @IsString()
  showtimeUUID!: string;

  @IsArray()
  @IsString({ each: true })
  seatUUIDs!: string[];
}