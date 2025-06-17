import { Prop } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export enum status_Order {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARED = 'PREPARED',
  CANCELED = 'CANCELED',
  SHIPPING = 'SHIPPING',
  SUCCESS = 'SUCCESS',
  Fail = 'Chưa thanh toán thành công'
}
export enum payType {
  transfer = 'transfer',
  cash = 'cash',
  credit_card = 'credit_card',
  vnpay = 'vnpay',
  momo = 'momo'
}
