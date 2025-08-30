import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { userType } from '../user.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  mail?: string;

  @IsEnum(userType)
  @IsNotEmpty()
  type: userType;

  @IsOptional()
  @IsString()
  status?: string = 'ACTIVE';
} 