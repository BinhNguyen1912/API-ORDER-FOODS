import { IsMongoId } from '@nestjs/class-validator'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { Types } from 'mongoose'
import { FoodItemDto } from 'src/orders/dto/create-order.dto'
export class CreateCartDto {
  @ValidateNested({ each: true })
  @Type(() => FoodItemDto)
  foods: FoodItemDto

  @IsOptional()
  totalPrice: number

  @IsOptional()
  isModify: boolean
}
