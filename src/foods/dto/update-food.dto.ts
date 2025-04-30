import { PartialType } from '@nestjs/mapped-types'
import { CreateFoodDto } from './create-food.dto'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateFoodDto extends PartialType(CreateFoodDto) {}
