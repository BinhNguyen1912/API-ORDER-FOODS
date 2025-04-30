import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Discount } from 'src/discount/Schema/discount.schema'
import { users } from 'src/users/Schema/user.schema'
@Schema({ timestamps: true })
export class UserVoucher extends Document {
  @Prop({ type: Types.ObjectId, ref: users.name })
  user_id: Types.ObjectId
  @Prop({ type: [Types.ObjectId], ref: Discount.name })
  ListDiscount: Types.ObjectId[]
}
export const UserVoucherSchema = SchemaFactory.createForClass(UserVoucher)
