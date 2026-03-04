import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateStaffDto {

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{9,11}$/, {
        message: "Phone number must be 9-11 digits"
    })
    phoneNumber?: string;

    @IsOptional()
    isBlocked?: boolean;
}