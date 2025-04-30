import { IsMongoId } from '@nestjs/class-validator'
import { Injectable } from '@nestjs/common'
import { IsOptional, IsString } from 'class-validator'
import { Types } from 'mongoose'
export class CreateConversationDto {
  @IsMongoId()
  receiver: Types.ObjectId
  @IsMongoId()
  sender: Types.ObjectId
  @IsString()
  content: string
  @IsOptional()
  createdAt?: Date
  @IsOptional()
  DeletedAt?: Date
}
