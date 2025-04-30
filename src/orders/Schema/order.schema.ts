import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { payType, status_Order } from './order.interface'
import { Id_Name } from 'src/users/Schema/User.Interface'
import { Food } from 'src/foods/Schema/food.schema'
import { Cart } from 'src/carts/Schema/cart.schema'
import { users } from 'src/users/Schema/user.schema'

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop()
  id?: Types.ObjectId
  @Prop({ type: String, enum: status_Order, default: status_Order.PENDING })
  status: status_Order
  @Prop()
  notes: string
  @Prop()
  phone: string
  @Prop()
  discount_code?: string //ma giam gia (neu co)

  @Prop()
  discountAmount?: number // Số tiền giảm giá từ mã giảm giá
  @Prop()
  finalPrice?: number // Tổng số tiền sau khi giảm giá
  @Prop({ type: Types.ObjectId, ref: users.name })
  id_customer: Types.ObjectId
  @Prop()
  cancellReason: string
  @Prop()
  address: string //dia chi giao hang
  @Prop({ type: String, enum: payType })
  paymentMethod: payType //dia chi giao hang
  @Prop({ type: Types.ObjectId, ref: Cart.name })
  cart_id: Types.ObjectId
  @Prop()
  transactionId: string
  @Prop()
  OrderTimePrepare: string
  @Prop()
  totalPrice: number
  @Prop()
  isPaied: boolean //Xac dinh da thanh toan chua
  @Prop({ type: Date, default: Date.now })
  createdAt: Date
  @Prop()
  updatedAt: Date
  @Prop()
  isDeleted: boolean
  @Prop()
  deletedAt: Date
}

export class FoodItem {
  @Prop({ type: Types.ObjectId, ref: Food.name }) // Tham chiếu đến Food
  foodID: Types.ObjectId // Đổi tên thành foodId để rõ ràng hơn
  @Prop()
  quality: number // Nếu bạn vẫn cần trường này
}
export const orderSchema = SchemaFactory.createForClass(Order)
// Thêm TTL Index: MongoDB sẽ tự động xóa sau 180 ngày
orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 })
