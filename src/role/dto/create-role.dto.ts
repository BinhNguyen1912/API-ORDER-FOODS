import { IsString } from '@nestjs/class-validator'
import { Type } from 'class-transformer'
import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator'
import { Types } from 'mongoose'

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsMongoId({ each: true })
  permissions: Types.ObjectId[]
}
