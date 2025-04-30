import { IsString } from '@nestjs/class-validator'
import { Type } from 'class-transformer'
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { Types } from 'mongoose'
export class categoryValidate {
  @IsString()
  name: string
}
export class CreateFoodDto {
  @IsString()
  @IsNotEmpty()
  name: string
  @IsNumber()
  @IsNotEmpty()
  price: number
  @IsString()
  description: string
  @IsString()
  @IsOptional()
  image: string
  @IsMongoId()
  @IsNotEmpty()
  category: Types.ObjectId
  @IsBoolean()
  @IsOptional()
  isBestSeller: boolean
  @IsBoolean()
  @IsOptional()
  isActive: boolean
}
