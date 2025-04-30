import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
@Schema({ timestamps: true })
export class Category extends Document {
  @Prop()
  id?: Types.ObjectId
  @Prop()
  name: string
  @Prop()
  createdAt: Date
  @Prop()
  updatedAt: Date
  @Prop()
  isDeleted: boolean
  @Prop()
  deletedAt: Date
}
export const CategorySchema = SchemaFactory.createForClass(Category)
