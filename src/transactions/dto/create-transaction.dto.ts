import { IsMongoId, IsOptional, IsString } from 'class-validator'
import { Types } from 'mongoose'
export class CreateTransactionDto {
  @IsMongoId()
  order_id: Types.ObjectId
  @IsMongoId()
  id_customer: Types.ObjectId

  @IsOptional()
  @IsString()
  status: string

  @IsOptional()
  amount: number //so tien

  @IsOptional()
  @IsString()
  transactionStatus: string // Trạng thái giao dịch (vd: '00' cho thành công, '01' cho thất bại)

  @IsOptional()
  @IsString()
  transactionId: string

  @IsString()
  @IsOptional()
  payDate: string
}
