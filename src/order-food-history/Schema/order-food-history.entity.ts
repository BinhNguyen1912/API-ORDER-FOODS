// order-food-history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class OrderFoodHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order_id: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  id_customer: Types.ObjectId

  @Prop([
    {
      foodID: { type: Types.ObjectId, ref: 'Food', required: true },
      quantity: { type: Number, required: true }
    }
  ])
  foods: { foodID: Types.ObjectId; quantity: number }[]
}

export const OrderFoodHistorySchema = SchemaFactory.createForClass(OrderFoodHistory)
