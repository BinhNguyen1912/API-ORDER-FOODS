import { Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
export class Comment extends Document {
  @Prop({ type: Types.ObjectId })
  orderId: Types.ObjectId
  @Prop()
  urlImage: string[]
}
export const CommentSchema = SchemaFactory.createForClass(Comment)
