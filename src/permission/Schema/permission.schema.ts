import { Optional } from '@nestjs/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop()
  path: string
  @Prop()
  method: string
  @Prop()
  module: string
  @Prop()
  name: string
  @Prop()
  isActive: boolean
}
export const PermissonSchema = SchemaFactory.createForClass(Permission)
