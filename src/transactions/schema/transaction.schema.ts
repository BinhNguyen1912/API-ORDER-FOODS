import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Order } from 'src/orders/Schema/order.schema'
import { users } from 'src/users/Schema/user.schema'
@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId })
  id?: Types.ObjectId
  @Prop({ type: Types.ObjectId, ref: Order.name })
  order_id: Types.ObjectId
  @Prop({ type: Types.ObjectId, ref: users.name })
  id_customer: Types.ObjectId
  @Prop()
  status: string
  @Prop()
  amount: number //so tien
  @Prop()
  transactionStatus: string // Trạng thái giao dịch (vd: '00' cho thành công, '01' cho thất bại)
  @Prop()
  transactionId: string // Mã giao dịch từ VNPay
  @Prop()
  payDate: string
  @Prop()
  createAt: Date
  @Prop()
  updateAt: Date
}
export const TranscationSchema = SchemaFactory.createForClass(Transaction)
