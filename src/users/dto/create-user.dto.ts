import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator'
import { Types } from 'mongoose'
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsMongoId()
  role?: Types.ObjectId

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsNotEmpty()
  phone: string //bat buoc

  @IsString()
  @IsOptional()
  avatar?: string //kh can
}
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
