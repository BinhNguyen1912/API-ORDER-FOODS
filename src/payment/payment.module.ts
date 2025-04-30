import { forwardRef, Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Order, orderSchema } from 'src/orders/Schema/order.schema'
import { OrdersModule } from 'src/orders/orders.module'
import { Transaction } from 'src/transactions/schema/transaction.schema'
import { TransactionsModule } from 'src/transactions/transactions.module'
import { NodemailerModule } from 'src/nodemailer/nodemailer.module'

@Module({
  imports: [forwardRef(() => OrdersModule), TransactionsModule, forwardRef(() => NodemailerModule)],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}
