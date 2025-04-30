import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Id_Name } from './User.Interface'
import { verifyType } from 'src/auth/auth.interface'
@Schema({ timestamps: true, collection: 'users' })
export class users extends Document {
  @Prop({ type: Types.ObjectId })
  _id?: Types.ObjectId
  @Prop()
  name: string
  @Prop({ type: Types.ObjectId })
  role?: Types.ObjectId
  @Prop()
  email: string
  @Prop()
  password: string
  @Prop()
  phone: string
  @Prop()
  avatar: string
  @Prop()
  refresh_token: string
  @Prop()
  verify_token: string
  @Prop()
  verify: verifyType
  @Prop()
  codeVerify: string
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
export const usersSchema = SchemaFactory.createForClass(users)
