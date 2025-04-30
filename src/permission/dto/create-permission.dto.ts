import { IsBoolean } from '@nestjs/class-validator'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Types } from 'mongoose'
export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  path: string
  @IsString()
  @IsNotEmpty()
  module: string
  @IsString()
  @IsNotEmpty()
  method: string
  @IsString()
  @IsNotEmpty()
  name: string
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean
}
