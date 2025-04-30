import { Transform, Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Types } from 'mongoose'
import { messageRespone } from 'src/common/Message'
import { payType, status_Order } from '../Schema/order.interface'
export class FoodItemDto {
  @IsMongoId({ message: messageRespone.ID_MUST_BE_OBJECTID })
  @IsNotEmpty({ message: messageRespone.ID_MUST_BE_NOT_EMPTY })
  foodID: Types.ObjectId
  @IsOptional()
  quality: number
}
export class CreateOrderDto {
  @IsOptional()
  @IsString()
  notes: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsMongoId()
  @IsNotEmpty()
  cart_id: Types.ObjectId

  @IsString()
  @IsNotEmpty()
  paymentMethod: payType

  @IsOptional()
  @IsString()
  discount_code: string

  @IsString()
  phone: string
}
export class CreateOrderHereDto extends CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  id_staff: Types.ObjectId

  @IsString()
  @IsNotEmpty()
  tableNumber: string

  @ValidateNested({ each: true })
  @Type(() => FoodItemDto)
  foods: FoodItemDto[]
}
export class CreateOrderOnlineDto extends CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  address: string

  @IsMongoId()
  @IsNotEmpty()
  cart_id: Types.ObjectId
}
