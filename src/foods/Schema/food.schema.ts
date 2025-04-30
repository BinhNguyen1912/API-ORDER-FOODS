import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Category } from 'src/category/Schema/category.schema'
import { Id_Name } from 'src/users/Schema/User.Interface'
@Schema({ timestamps: true })
export class Food extends Document {
  @Prop()
  id: Types.ObjectId
  @Prop()
  name: string
  @Prop()
  price: number
  @Prop()
  description: string
  @Prop()
  image: string
  @Prop({ type: Types.ObjectId, ref: Category.name })
  category: Types.ObjectId
  @Prop()
  qualitySold: number
  @Prop()
  isBestSeller: boolean
  @Prop({ default: true })
  isActive: boolean
  @Prop()
  createdAt: Date
  @Prop()
  updatedAt: Date
  @Prop()
  isDeleted: boolean
  @Prop()
  deletedAt: Date
  @Prop({ type: Object })
  createdBy: Id_Name
  @Prop({ type: Object })
  updateBy: Id_Name
  @Prop({ type: Object })
  deleteBy: Id_Name
}
export const foodsSchema = SchemaFactory.createForClass(Food)
