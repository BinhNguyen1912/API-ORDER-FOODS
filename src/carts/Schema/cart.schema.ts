import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Food } from 'src/foods/Schema/food.schema'
import { FoodItem } from 'src/orders/Schema/order.schema'
import { users } from 'src/users/Schema/user.schema'
@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: users.name })
  customer_id: Types.ObjectId
  @Prop()
  isOrder: boolean
  @Prop({ type: [{ foodID: { type: Types.ObjectId, ref: Food.name }, quality: Number, _id: false }] })
  foods: FoodItem[]
  @Prop()
  totalPrice?: number
  @Prop()
  isModify?: boolean
}
export const CartSchema = SchemaFactory.createForClass(Cart)
