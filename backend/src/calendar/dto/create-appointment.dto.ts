import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDate } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDate()
  @IsNotEmpty()
  startTime: string;

  @IsDate()
  @IsNotEmpty()
  endTime: string;

  @IsOptional()
  @IsEmail()
  mail?: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

} 