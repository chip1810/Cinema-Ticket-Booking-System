import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
} from "class-validator";
import { VoucherType } from "./../models/enums/VoucherType";

export class UpdateVoucherDTO {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(VoucherType)
  type?: VoucherType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  perUserLimit?: number;
}
