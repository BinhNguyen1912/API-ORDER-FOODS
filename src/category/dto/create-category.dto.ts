import { IsArray } from '@nestjs/class-validator'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { FoodItem } from 'src/orders/Schema/order.schema'

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string
}
