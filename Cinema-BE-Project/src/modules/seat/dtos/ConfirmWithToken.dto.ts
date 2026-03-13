
import { IsString, IsNotEmpty } from "class-validator";

export class ConfirmWithTokenDTO {
  @IsString()
  @IsNotEmpty()
  checkoutToken!: string;
}