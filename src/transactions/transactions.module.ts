import { Module } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { TransactionsController } from './transactions.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { TracingChannel } from 'diagnostics_channel'
import { Transaction, TranscationSchema } from './schema/transaction.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TranscationSchema, collection: Transaction.name }])
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService]
})
export class TransactionsModule {}
