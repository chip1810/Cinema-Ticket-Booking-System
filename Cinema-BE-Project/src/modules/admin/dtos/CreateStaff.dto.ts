import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from "class-validator";

export class CreateStaffDto {

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password!: string;

    @IsString()
    @IsNotEmpty()
    fullName!: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{9,11}$/, {
        message: "Phone number must be 9-11 digits"
    })
    phoneNumber?: string;
}