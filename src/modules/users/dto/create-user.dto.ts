import { IsEmail, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;
}
