import {
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from "class-validator";

export class HoldSeatDTO {
  @IsUUID()
  showtimeUUID!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID("all", { each: true })
  seatUUIDs!: string[];
}