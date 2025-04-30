import { IsString } from '@nestjs/class-validator'
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, Min, min } from 'class-validator'
import { Types } from 'mongoose'
import { type_Discount } from '../Schema/types'
export class CreateDiscountDto {
  @IsNumber()
  @IsNotEmpty()
  useLimit: number //so luong sd
  @IsNumber()
  @IsNotEmpty()
  DateDiscount: number
  @IsOptional()
  usedCode: number //so luong da dung
  @IsOptional()
  ListFood?: Types.ObjectId[] //mon an duoc ap dung
  @IsOptional()
  ListUser?: Types.ObjectId[] //user duoc ap dung
  @IsNumber()
  @IsNotEmpty()
  minOrder: number //gia tri don hang toi thieu
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  DiscountValue: number //50% , 50.000vnd
  @IsString()
  @IsNotEmpty()
  @IsEnum(type_Discount)
  typeDiscount: string
  @IsNotEmpty()
  @IsNumber()
  maxDiscount: number
}
