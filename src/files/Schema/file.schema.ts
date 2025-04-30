import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { users } from 'src/users/Schema/user.schema'
@Schema({ timestamps: true })
export class File extends Document {
  @Prop()
  data: Buffer //ảnh dưới dạng nhị phân
  @Prop()
  filename: string
  @Prop()
  mimetype: string
  @Prop()
  user_id: Types.ObjectId
}

export const FileSchema = SchemaFactory.createForClass(File)
