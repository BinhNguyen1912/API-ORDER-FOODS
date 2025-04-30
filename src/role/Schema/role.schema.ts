import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Permission } from 'src/permission/Schema/permission.schema'
@Schema({ timestamps: true })
export class Role extends Document {
  @Prop()
  name: string
  @Prop({ type: [Types.ObjectId], ref: Permission.name })
  permissions: Types.ObjectId[]
}
export const RoleSchema = SchemaFactory.createForClass(Role)
