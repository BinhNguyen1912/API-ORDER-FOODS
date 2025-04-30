import { Injectable } from '@nestjs/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { users } from 'src/users/Schema/user.schema'

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: Types.ObjectId, ref: users.name })
  receiver: Types.ObjectId
  @Prop({ type: Types.ObjectId, ref: users.name })
  sender: Types.ObjectId
  @Prop()
  content: string
  @Prop()
  createdAt?: Date
  @Prop()
  DeletedAt?: Date
}
export const ConversationSchema = SchemaFactory.createForClass(Conversation)
