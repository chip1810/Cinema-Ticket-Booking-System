import { IsArray, IsString,  } from "class-validator";

export class HoldSeatDTO {

  @IsString()
  showtimeUUID!: string;

  @IsArray()
  @IsString({ each: true })
  seatUUIDs!: string[];
}