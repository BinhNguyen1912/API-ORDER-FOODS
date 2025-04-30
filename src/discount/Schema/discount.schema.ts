import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { type_Discount } from './types'
@Schema({ timestamps: true })
export class Discount extends Document {
  @Prop({ type: Types.ObjectId })
  _id?: Types.ObjectId
  @Prop()
  code: string
  @Prop()
  useLimit: number //so luong sd
  @Prop()
  startDate: Date //ngày kết thúc
  @Prop()
  endDate: Date //ngày kết thúc
  @Prop()
  isActive: boolean
  @Prop()
  DateDiscount: number //so ngay su dung -> suy ra endDate
  @Prop()
  usedCode: number //so luong da dung
  @Prop()
  ListFood?: Types.ObjectId[] //mon an duoc ap dung
  @Prop()
  ListUser?: Types.ObjectId[] //user duoc ap dung
  @Prop()
  minOrder: number //gia tri don hang toi thieu
  @Prop()
  DiscountValue: number //50% , 50.000vnd
  @Prop({ type: String, enum: type_Discount })
  typeDiscount: type_Discount
  @Prop()
  maxDiscount: number
  @Prop()
  createdAt: Date
  @Prop()
  updatedAt: Date
}
// Tạo TTL index trên trường endDate
const DiscountSchema = SchemaFactory.createForClass(Discount) // Đổi tên `Schema` thành `DiscountSchema`
DiscountSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 })

export { DiscountSchema }
