import { IsUUID, IsInt, Min } from "class-validator";

export class ConcessionItemDTO {
  @IsUUID()
  concessionUUID!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}