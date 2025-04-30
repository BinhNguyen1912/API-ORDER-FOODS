import { IsString } from '@nestjs/class-validator'
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator'
import { Types } from 'mongoose'
export class CreatePaymentDto {
  @IsString()
  @IsOptional()
  locale: string
  @IsMongoId()
  @IsNotEmpty()
  orderId: Types.ObjectId
  @IsOptional()
  @IsString()
  bankCode: string
}
