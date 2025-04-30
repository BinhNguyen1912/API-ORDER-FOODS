import { PartialType } from '@nestjs/mapped-types'
import { CreateOrderHereDto, CreateOrderOnlineDto } from './create-order.dto'
import { status_Order } from '../Schema/order.interface'
import { IsOptional, IsString } from 'class-validator'

export class UpdateOrderOnlineDto extends PartialType(CreateOrderOnlineDto) {}
