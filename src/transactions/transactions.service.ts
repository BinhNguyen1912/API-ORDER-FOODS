import { Injectable } from '@nestjs/common'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Transaction } from './schema/transaction.schema'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { Types } from 'mongoose'

@Injectable()
export class TransactionsService {
  constructor(@InjectModel(Transaction.name) private transactionModule: SoftDeleteModel<Transaction>) {}
  async create(createTransactionDto: CreateTransactionDto) {
    // const { amount, methodPay, order_id, paymentMethod, status, transactionId, transactionStatus } =
    //   createTransactionDto
    return await this.transactionModule.create({
      ...createTransactionDto
    })
  }

  findAll() {}

  async findOrderIdOfTransaction(order_id: string) {
    return await this.transactionModule.findOne({ order_id: new Types.ObjectId(order_id) })
  }

  async findOne(id: string) {
    return await this.transactionModule.findById(id).populate([
      { path: 'id_customer', select: 'email name phone' },
      { path: 'order_id', select: 'cart_id', populate: { path: 'foods.foodID', select: 'name price' } }
    ])
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`
  }
}
