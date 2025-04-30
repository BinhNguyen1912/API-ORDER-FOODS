import { forwardRef, Module } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Order, orderSchema } from './Schema/order.schema'
import { Cart, CartSchema } from 'src/carts/Schema/cart.schema'
import { NodemailerModule } from 'src/nodemailer/nodemailer.module'
import { MailerModule, MailerService } from '@nestjs-modules/mailer'
import { NodemailerService } from 'src/nodemailer/nodemailer.service'
import { PaymentModule } from 'src/payment/payment.module'
import { CartsModule } from 'src/carts/carts.module'
import { DiscountModule } from 'src/discount/discount.module'

@Module({
  imports: [
    forwardRef(() => NodemailerModule),
    MongooseModule.forFeature([
      { name: Order.name, schema: orderSchema, collection: Order.name },
      { name: Cart.name, schema: CartSchema, collection: Cart.name }
    ]),
    forwardRef(() => PaymentModule),
    CartsModule,
    DiscountModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
