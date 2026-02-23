import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDTO {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!: string;

    @IsNotEmpty()
    @IsString()
    fullName!: string;
}

export class LoginDTO {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}

export class ResetPasswordDTO {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    token!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword!: string;
}
