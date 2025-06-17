import { Injectable } from '@nestjs/common'
import { CreateOrderFoodHistoryDto } from './dto/create-order-food-history.dto'
import { UpdateOrderFoodHistoryDto } from './dto/update-order-food-history.dto'
import { OrderFoodHistory } from './Schema/order-food-history.entity'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Injectable()
export class OrderFoodHistoryService {
  constructor(@InjectModel(OrderFoodHistory.name) private orderFoodHistoryModule: SoftDeleteModel<OrderFoodHistory>) {}
  async saveOrderFoodHistory(data: {
    order_id: string
    id_customer: string
    foods: { foodID: string; quantity: number }[]
  }) {
    return await this.orderFoodHistoryModule.create({
      order_id: new Types.ObjectId(data.order_id),
      id_customer: new Types.ObjectId(data.id_customer),
      foods: data.foods.map((food) => ({
        foodID: new Types.ObjectId(food.foodID),
        quantity: food.quantity
      }))
    })
  }

  async getOrderFoodHistory(user_id: string, limit: number, page: number) {
    const [orders, total] = await Promise.all([
      this.orderFoodHistoryModule
        .find({ id_customer: new Types.ObjectId(user_id) })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('foods.foodID', 'name price')
        .populate('order_id', 'finalPrice paymentMethod status')
        .exec(),
      this.orderFoodHistoryModule.countDocuments({ id_customer: new Types.ObjectId(user_id) })
    ])

    return {
      orders,
      total,
      page,
      totalPage: Math.ceil(total / limit)
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} orderFoodHistory`
  }

  update(id: number, updateOrderFoodHistoryDto: UpdateOrderFoodHistoryDto) {
    return `This action updates a #${id} orderFoodHistory`
  }

  remove(id: number) {
    return `This action removes a #${id} orderFoodHistory`
  }
}
